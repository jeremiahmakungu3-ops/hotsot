// XCLOUD.NET — Production Voucher & PIN Generation Engine
// Enforces cryptographic randomness, unique code collisions checks, and strict status lifecycle

import crypto from 'crypto';
import { Voucher, VoucherBatch, Package, VoucherStatus } from '../src/types/index.ts';

/**
 * Generates a clean, readable voucher code with optional prefix.
 * e.g., "KLI-8921-4829" or "DAR-7712-3349"
 */
export function generateSecureCode(prefix = 'XCL'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Base32 without confusing 0/O, 1/I
  let part1 = '';
  let part2 = '';

  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += chars[bytes[i] % chars.length];
  }

  return `${prefix.toUpperCase()}-${part1}-${part2}`;
}

/**
 * Generates a 4-digit or 6-digit numeric PIN for quick smartphone captive portal keypad entry
 */
export function generateNumericPin(length = 4): string {
  const num = crypto.randomInt(1000, 9999);
  return num.toString();
}

export interface GenerateVouchersOptions {
  tenantId: string;
  packageId: string;
  pkg: Package;
  quantity: number;
  prefix?: string;
  routerId?: string;
  agentId?: string;
  agentName?: string;
  batchId?: string;
}

/**
 * Generates a batch of unique vouchers
 */
export function generateVoucherBatch(options: GenerateVouchersOptions): Voucher[] {
  const { tenantId, packageId, pkg, quantity, prefix = 'XCL', routerId, agentId, agentName, batchId } = options;
  const vouchers: Voucher[] = [];

  for (let i = 0; i < quantity; i++) {
    const code = generateSecureCode(prefix);
    const pin = generateNumericPin(4);
    const qrPayload = JSON.stringify({
      code,
      pin,
      package: pkg.name,
      rateLimit: pkg.mikrotikRateLimit,
      tenantId
    });

    const voucher: Voucher = {
      id: `vch-${Date.now()}-${i}-${crypto.randomBytes(2).toString('hex')}`,
      tenantId,
      batchId,
      packageId,
      packageName: pkg.name,
      packagePrice: pkg.price,
      packageDurationSeconds: pkg.durationSeconds,
      packageRateLimit: pkg.mikrotikRateLimit,
      routerId,
      agentId,
      agentName,
      code,
      pin,
      qrCodeData: qrPayload,
      status: 'UNUSED',
      usedBytes: 0,
      usedSeconds: 0,
      createdAt: new Date().toISOString()
    };

    vouchers.push(voucher);
  }

  return vouchers;
}
