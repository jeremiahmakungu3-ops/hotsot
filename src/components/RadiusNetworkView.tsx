import React from 'react';
import {
  Server,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Layers,
  FileCode2,
  Clock
} from 'lucide-react';
import { Tenant } from '../types/index.ts';

interface RadiusNetworkViewProps {
  currentTenant: Tenant | null;
}

export const RadiusNetworkView: React.FC<RadiusNetworkViewProps> = ({ currentTenant }) => {
  return (
    <div id="radius-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
              FREERADIUS 3.0 DAEMON & AAA ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">Ports: 1812/UDP • 1813/UDP • 3799/UDP (CoA)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            FreeRADIUS & Network Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized AAA authentication authority, RFC 2866 accounting, and MikroTik VSA rate-limit distribution.
          </p>
        </div>
      </div>

      {/* RADIUS Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RADIUS Auth Engine</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-xl font-black text-white font-mono">PORT 1812/UDP</div>
          <div className="text-[11px] text-emerald-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Bound & Accepting Requests
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interim Accounting</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">PORT 1813/UDP</div>
          <div className="text-[11px] text-cyan-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 60s Interim Interval
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RFC 3576 CoA / Disconnect</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">PORT 3799/UDP</div>
          <div className="text-[11px] text-indigo-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Disconnect-ACK enabled
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Auth Latency</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">1.8 ms</div>
          <div className="text-[11px] text-slate-400">Ultra-low in-memory lookup</div>
        </div>
      </div>

      {/* MikroTik VSA Dictionary & REST Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">MikroTik Vendor-Specific Attributes (VSA)</h2>
          </div>

          <p className="text-xs text-slate-400">
            FreeRADIUS automatically maps subscriber rate-limits directly to RouterOS Dynamic Simple Queues via dictionary attributes:
          </p>

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
            <div>VENDOR Mikrotik 14988</div>
            <div>ATTRIBUTE Mikrotik-Rate-Limit 1 string</div>
            <div>ATTRIBUTE Mikrotik-Recv-Limit 2 integer</div>
            <div>ATTRIBUTE Mikrotik-Xmit-Limit 3 integer</div>
            <div>ATTRIBUTE Mikrotik-Group 4 string</div>
            <div>ATTRIBUTE Mikrotik-Total-Limit 17 integer</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="font-mono text-white">Rate-Limit Expression:</span>
              <span className="font-mono font-bold text-emerald-400">Rx/Tx (e.g. 5M/10M)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="font-mono text-white">Session-Timeout Expression:</span>
              <span className="font-mono font-bold text-emerald-400">Seconds (e.g. 86400)</span>
            </div>
          </div>
        </div>

        {/* Database & Background Queue Broker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">PostgreSQL 16 & Redis 7 BullMQ Cluster</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">PostgreSQL 16 Primary DB</span>
                <span className="text-[11px] text-slate-400 font-mono">Prisma ORM • Connection Pool: 25 active</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                HEALTHY
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Redis 7.2 In-Memory Cache</span>
                <span className="text-[11px] text-slate-400 font-mono">Session state & Fast RADIUS token verification</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                HEALTHY
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">BullMQ Background Workers</span>
                <span className="text-[11px] text-slate-400 font-mono">Voucher batch generator & SMS notifications</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                IDLE (READY)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
