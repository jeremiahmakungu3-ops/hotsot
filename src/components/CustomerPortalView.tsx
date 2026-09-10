import React from 'react';
import {
  UserCheck,
  Wifi,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Customer, Tenant } from '../types/index.ts';

interface CustomerPortalViewProps {
  currentTenant: Tenant | null;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ currentTenant }) => {
  return (
    <div id="customer-portal-view" className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
              SUBSCRIBER SELF-SERVICE PORTAL
            </span>
            <span className="text-xs text-slate-400 font-mono">Fiber Status • Invoices • Top-up</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Customer Self-Care Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Self-service portal where home and office fiber subscribers manage subscriptions and view usage.
          </p>
        </div>
      </div>

      {/* Subscriber Card & Service Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              AK
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">Ally Khamis</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  ACTIVE FIBER
                </span>
              </div>
              <p className="text-xs text-slate-400">Account: DAR-CUST-99182 • Mikocheni, Dar es Salaam</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer">
              Renew Monthly Plan
            </button>
          </div>
        </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Subscribed Plan</span>
            <div className="text-lg font-black text-white">Dedicated Fiber 20Mbps</div>
            <div className="text-[11px] text-cyan-400 font-mono">Unlimited Symmetrical Bandwidth</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Current Month Traffic</span>
            <div className="text-lg font-black text-emerald-400 font-mono">342.8 GB</div>
            <div className="text-[11px] text-slate-500">No Fair Usage Policy throttling</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Billing Renewal</span>
            <div className="text-lg font-black text-amber-400 font-mono">In 18 Days</div>
            <div className="text-[11px] text-slate-500">Auto-dispatches M-Pesa STK reminder</div>
          </div>
        </div>
      </div>
    </div>
  );
};
