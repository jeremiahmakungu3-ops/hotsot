import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Power,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Shield,
  Wifi
} from 'lucide-react';
import { HotspotSession, Tenant } from '../types/index.ts';
import { disconnectSession } from '../lib/api.ts';

interface SessionsViewProps {
  sessions: HotspotSession[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ sessions, currentTenant, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const activeSessions = sessions.filter((s) => s.isActive);

  const filteredSessions = activeSessions.filter((s) => {
    return (
      searchQuery === '' ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ipAddress.includes(searchQuery) ||
      s.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.routerName && s.routerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleDisconnect = async (sessionId: string) => {
    if (confirm('Send RADIUS CoA Disconnect packet (RFC 3576) to kick this subscriber?')) {
      setDisconnectingId(sessionId);
      try {
        await disconnectSession(sessionId);
        onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setDisconnectingId(null);
      }
    }
  };

  return (
    <div id="sessions-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              REAL-TIME SUBSCRIBER SESSIONS
            </span>
            <span className="text-xs text-slate-400 font-mono">RFC 2866 Accounting • RFC 3576 CoA</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Live Connected Sessions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time Hotspot & PPPoE bandwidth utilization with instant RADIUS disconnect authority.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filter & Metric summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Connected Users</span>
            <div className="text-xl font-black text-white mt-0.5">{activeSessions.length}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Download Rx</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5">
              {(
                activeSessions.reduce((acc, s) => acc + (s.bytesIn || 0), 0) /
                (1024 * 1024)
              ).toFixed(1)}{' '}
              MB
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Upload Tx</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">
              {(
                activeSessions.reduce((acc, s) => acc + (s.bytesOut || 0), 0) /
                (1024 * 1024)
              ).toFixed(1)}{' '}
              MB
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by voucher username, IP, MAC address, or router..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredSessions.length}</strong> active sessions
        </span>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Subscriber / Code</th>
                <th className="py-3.5 px-4">Gateway Router</th>
                <th className="py-3.5 px-4">Framed IP & MAC</th>
                <th className="py-3.5 px-4">Session Duration</th>
                <th className="py-3.5 px-4">Rx / Tx Traffic</th>
                <th className="py-3.5 px-4">MikroTik Rate Limit</th>
                <th className="py-3.5 px-4 text-right">Disconnect (CoA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active sessions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{s.username}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {s.routerName || 'MikroTik Gateway'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <div>{s.ipAddress}</div>
                      <div className="text-[10px] text-slate-500">{s.macAddress}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {Math.floor(s.durationSeconds / 60)} min {s.durationSeconds % 60}s
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-cyan-400">
                        ↓ {(s.bytesIn / (1024 * 1024)).toFixed(1)} MB
                      </div>
                      <div className="text-indigo-400">
                        ↑ {(s.bytesOut / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                      {s.rateLimitApplied || '5M/10M'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={disconnectingId === s.id}
                        onClick={() => handleDisconnect(s.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center space-x-1 ml-auto transition-colors cursor-pointer"
                        title="RFC 3576 Disconnect"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{disconnectingId === s.id ? 'Kicking...' : 'Kick User'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
