import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardMetrics, Tenant } from '../types/index.ts';

interface ReportsViewProps {
  metrics: DashboardMetrics | null;
  currentTenant: Tenant | null;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export const ReportsView: React.FC<ReportsViewProps> = ({ metrics, currentTenant }) => {
  const [reportRange, setReportRange] = useState('7d');

  const reportData = [
    { name: 'Monday', hotspotRevenue: 125000, pppoeRevenue: 150000, activeUsers: 48 },
    { name: 'Tuesday', hotspotRevenue: 190000, pppoeRevenue: 120000, activeUsers: 59 },
    { name: 'Wednesday', hotspotRevenue: 160000, pppoeRevenue: 170000, activeUsers: 52 },
    { name: 'Thursday', hotspotRevenue: 240000, pppoeRevenue: 130000, activeUsers: 74 },
    { name: 'Friday', hotspotRevenue: 310000, pppoeRevenue: 180000, activeUsers: 92 },
    { name: 'Saturday', hotspotRevenue: 380000, pppoeRevenue: 210000, activeUsers: 115 },
    { name: 'Sunday', hotspotRevenue: 290000, pppoeRevenue: 160000, activeUsers: 88 }
  ];

  return (
    <div id="reports-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
              BUSINESS INTELLIGENCE & AUDIT
            </span>
            <span className="text-xs text-slate-400 font-mono">Revenue Trends • Carrier Breakdown • PDF/CSV</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Financial & Network Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs and comparative revenue analytics across mobile money gateways and agent networks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white">HotSpot vs. PPPoE Fiber Revenue (TZS)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
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
                    fontSize: '11px'
                  }}
                  formatter={(val: number) => [`TZS ${val.toLocaleString()}`]}
                />
                <Bar dataKey="hotspotRevenue" name="HotSpot Vouchers" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pppoeRevenue" name="Monthly PPPoE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carrier Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white">Revenue by Mobile Carrier</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Vodacom M-Pesa</span>
                <span className="text-[11px] text-slate-400">42% total share</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">TZS 1,280,000</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Airtel Money</span>
                <span className="text-[11px] text-slate-400">26% total share</span>
              </div>
              <span className="font-mono font-bold text-cyan-400">TZS 790,000</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Tigo Pesa (Mixx)</span>
                <span className="text-[11px] text-slate-400">22% total share</span>
              </div>
              <span className="font-mono font-bold text-indigo-400">TZS 670,000</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Selcom & Bank Pay</span>
                <span className="text-[11px] text-slate-400">10% total share</span>
              </div>
              <span className="font-mono font-bold text-amber-400">TZS 305,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
