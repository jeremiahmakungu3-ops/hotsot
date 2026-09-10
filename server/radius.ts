// XCLOUD.NET — FreeRADIUS Authentication & Accounting Service
// Implements standard RADIUS Access-Request, Access-Accept/Reject, and RFC 2866 Accounting with MikroTik VSAs

import { vouchers, hotspotSessions, packages, auditLogs, routers } from './db.ts';
import { HotspotSession, Voucher } from '../src/types/index.ts';

export interface RadiusAuthRequest {
  username: string;
  password?: string;
  nasIpAddress?: string;
  callingStationId?: string; // MAC address
  framedIpAddress?: string;
  tenantId?: string;
}

export interface RadiusAuthResponse {
  code: 'Access-Accept' | 'Access-Reject';
  replyMessage?: string;
  attributes?: {
    'Mikrotik-Rate-Limit'?: string;
    'Session-Timeout'?: number;
    'Acct-Interim-Interval'?: number;
    'Port-Limit'?: number;
    'Framed-IP-Address'?: string;
  };
  voucher?: Voucher;
}

export interface RadiusAccountingRequest {
  acctStatusType: 'Start' | 'Interim-Update' | 'Stop';
  username: string;
  acctSessionId: string;
  nasIpAddress: string;
  framedIpAddress?: string;
  callingStationId?: string; // MAC
  acctInputOctets?: number;
  acctOutputOctets?: number;
  acctSessionTime?: number;
  acctTerminateCause?: string;
}

/**
 * Processes a RADIUS Access-Request
 */
export function handleRadiusAuth(req: RadiusAuthRequest): RadiusAuthResponse {
  const codeOrUser = req.username.trim();
  const voucher = vouchers.find(v => v.code === codeOrUser || v.pin === codeOrUser);

  if (!voucher) {
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'RADIUS_AUTH_REJECT',
      resource: 'RadiusAuth',
      ipAddress: req.framedIpAddress || req.nasIpAddress,
      details: { username: req.username, reason: 'Voucher code not found' },
      result: 'FAILED',
      createdAt: new Date().toISOString()
    });
    return {
      code: 'Access-Reject',
      replyMessage: 'Invalid Voucher Code or PIN.'
    };
  }

  if (voucher.status === 'EXPIRED' || voucher.status === 'REVOKED') {
    return {
      code: 'Access-Reject',
      replyMessage: 'This voucher has already expired.'
    };
  }

  const pkg = packages.find(p => p.id === voucher.packageId);
  const rateLimit = voucher.packageRateLimit || (pkg ? pkg.mikrotikRateLimit : '5M/10M');
  const duration = voucher.packageDurationSeconds || (pkg ? pkg.durationSeconds : 3600);

  // If UNUSED, change to ACTIVE on first authentication
  if (voucher.status === 'UNUSED' || voucher.status === 'GENERATED') {
    voucher.status = 'ACTIVE';
    voucher.activatedAt = new Date().toISOString();
    voucher.expiresAt = new Date(Date.now() + duration * 1000).toISOString();
    voucher.redeemedMacAddress = req.callingStationId;
    voucher.redeemedIpAddress = req.framedIpAddress;
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    tenantId: voucher.tenantId,
    action: 'RADIUS_AUTH_ACCEPT',
    resource: 'RadiusAuth',
    resourceId: voucher.id,
    ipAddress: req.framedIpAddress || req.nasIpAddress,
    details: { username: voucher.code, rateLimit, mac: req.callingStationId },
    result: 'SUCCESS',
    createdAt: new Date().toISOString()
  });

  return {
    code: 'Access-Accept',
    replyMessage: 'Authentication Successful',
    attributes: {
      'Mikrotik-Rate-Limit': rateLimit,
      'Session-Timeout': duration,
      'Acct-Interim-Interval': 60,
      'Port-Limit': 1
    },
    voucher
  };
}

/**
 * Processes RADIUS Accounting packet (Start / Interim-Update / Stop)
 */
export function handleRadiusAccounting(req: RadiusAccountingRequest): { success: boolean; message: string } {
  const voucher = vouchers.find(v => v.code === req.username);
  const router = routers.find(r => r.ipAddress === req.nasIpAddress || r.publicIp === req.nasIpAddress) || routers[0];

  if (req.acctStatusType === 'Start') {
    // Check if session already exists
    let session = hotspotSessions.find(s => s.username === req.username && s.isActive);
    if (!session) {
      session = {
        id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenantId: voucher ? voucher.tenantId : router.tenantId,
        routerId: router.id,
        routerName: router.name,
        voucherId: voucher?.id,
        username: req.username,
        ipAddress: req.framedIpAddress || '10.100.1.50',
        macAddress: req.callingStationId || '00:00:00:00:00:00',
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        bytesIn: 0,
        bytesOut: 0,
        isActive: true,
        rateLimitApplied: voucher?.packageRateLimit || '5M/10M'
      };
      hotspotSessions.unshift(session);
    }
  } else if (req.acctStatusType === 'Interim-Update') {
    const session = hotspotSessions.find(s => s.username === req.username && s.isActive);
    if (session) {
      session.durationSeconds = req.acctSessionTime || session.durationSeconds + 60;
      session.bytesIn = req.acctInputOctets || session.bytesIn;
      session.bytesOut = req.acctOutputOctets || session.bytesOut;
    }
    if (voucher) {
      voucher.usedBytes = (req.acctInputOctets || 0) + (req.acctOutputOctets || 0);
      voucher.usedSeconds = req.acctSessionTime || voucher.usedSeconds;
    }
  } else if (req.acctStatusType === 'Stop') {
    const session = hotspotSessions.find(s => s.username === req.username && s.isActive);
    if (session) {
      session.isActive = false;
      session.durationSeconds = req.acctSessionTime || session.durationSeconds;
      session.bytesIn = req.acctInputOctets || session.bytesIn;
      session.bytesOut = req.acctOutputOctets || session.bytesOut;
    }
  }

  return { success: true, message: `Accounting ${req.acctStatusType} processed.` };
}
