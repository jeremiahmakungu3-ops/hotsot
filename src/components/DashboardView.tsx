import React from 'react';
import {
  Banknote,
  Users,
  Router as RouterIcon,
  Ticket,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Wifi,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  SmartphoneNfc,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DashboardMetrics, Tenant } from '../types/index.ts';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  currentTenant: Tenant | null;
  onNavigate: (tab: any) => void;
  liveEvents: any[];
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  currentTenant,
  onNavigate,
  liveEvents
}) => {
  if (!metrics) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="flex items-center space-x-3 text-cyan-400 font-medium">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Synchronizing XCLOUD.NET Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with ISP Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold tracking-wide">
              {currentTenant?.slug.toUpperCase()} • TANZANIA (TZS)
            </span>
            <span className="flex items-center text-xs text-emerald-400 space-x-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>FreeRADIUS & MikroTik v7 Connected</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            {currentTenant?.name || 'DarNet HighSpeed ISP'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Hotspot Billing, RouterOS v7 Automation & Mobile Money Gateway
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-dash-pos"
            onClick={() => onNavigate('agents')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open Agent POS</span>
          </button>
          <button
            id="btn-dash-captive"
            onClick={() => onNavigate('captive-portal')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Captive Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Revenue Today</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">
              TZS {metrics.revenueToday.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+18.4% from yesterday</span>
          </div>
        </div>

        {/* Active HotSpot Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active HotSpot Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {metrics.activeHotspotUsers}
            </span>
            <span className="text-xs text-slate-400 font-medium">sessions</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />
            <span>Bandwidth: {metrics.bandwidthUsageGb} GB consumed</span>
          </div>
        </div>

        {/* Online Routers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">MikroTik Gateways</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <RouterIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {metrics.onlineRouters}
            </span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">ONLINE</span>
            {metrics.offlineRouters > 0 && (
              <span className="text-xs text-rose-400 font-semibold font-mono ml-1">
                ({metrics.offlineRouters} OFFLINE)
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400">
            <span>RouterOS v7 REST & RADIUS Active</span>
          </div>
        </div>

        {/* Active Vouchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Vouchers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {metrics.activeVouchers}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {metrics.totalVouchers} total</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-amber-400 font-medium">
            <span>Agent POS Float: TZS {metrics.agentSalesToday.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">7-Day Revenue Trend (TZS)</h2>
              <p className="text-xs text-slate-400">Mobile Money (M-Pesa, Airtel, Tigo, Selcom) + POS Sales</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Total Month: TZS {metrics.revenueThisMonth.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dailyRevenueChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(val: number) => [`TZS ${val.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mobile Money Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Payment Gateways Split</h2>
            <p className="text-xs text-slate-400">Tanzania Mobile Money & POS</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.paymentMethodBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {metrics.paymentMethodBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(val: number) => [`TZS ${val.toLocaleString()}`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
            {metrics.paymentMethodBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">
                  TZS {(item.value / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Traffic Consumption */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Bandwidth Utilization (Mbps)</h2>
              <p className="text-xs text-slate-400">Aggregated WAN Download & Upload Traffic</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center text-cyan-400">
                <ArrowDownCircle className="w-3.5 h-3.5 mr-1" /> Download
              </span>
              <span className="flex items-center text-indigo-400">
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> Upload
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.hourlyTrafficChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(val: number, name: string) => [`${val} Mbps`, name]}
                />
                <Bar dataKey="downloadMbps" name="Download" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="uploadMbps" name="Upload" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live WebSocket Event Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Live Network Telemetry</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-56 custom-scrollbar pr-1">
            {liveEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Listening for FreeRADIUS & MikroTik heartbeat events...
              </div>
            ) : (
              liveEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs flex items-start justify-between gap-2 animate-in fade-in slide-in-from-right-2 duration-150"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">
                      {ev.payload?.message || JSON.stringify(ev.payload)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
