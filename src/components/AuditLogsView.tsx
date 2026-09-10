import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AuditLog, Tenant } from '../types/index.ts';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, currentTenant, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = auditLogs.filter((log) => {
    return (
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery)) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div id="audit-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold">
              SECURITY AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Log • IP Geolocation • Admin Actions</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            System Security & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete record of administrative commands, voucher redemptions, and router synchronizations.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, user, or IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total audit entries: <strong className="text-white">{filtered.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource Target</th>
                <th className="py-3.5 px-4">Operator / User</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {log.resource} {log.resourceId ? `(${log.resourceId})` : ''}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.userName || 'System Auto'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400 text-right">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
