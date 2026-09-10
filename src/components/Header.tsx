import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Ticket,
  Router as RouterIcon,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Tenant, User } from '../types/index.ts';

interface HeaderProps {
  currentTenant: Tenant | null;
  onOpenQuickVoucher: () => void;
  onOpenAddRouter: () => void;
  onOpenPos: () => void;
  notifications: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTenant,
  onOpenQuickVoucher,
  onOpenAddRouter,
  onOpenPos,
  notifications,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      id="xcloud-header"
      className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Search & Breadcrumb */}
      <div className="flex items-center space-x-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search routers, vouchers, customers, IP, MAC or transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Quick Actions & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Fast Action Buttons */}
        <button
          id="btn-quick-voucher"
          onClick={onOpenQuickVoucher}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Generate Voucher</span>
        </button>

        <button
          id="btn-quick-router"
          onClick={onOpenAddRouter}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <RouterIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add MikroTik</span>
        </button>

        <button
          id="btn-quick-pos"
          onClick={onOpenPos}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fast POS</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Alerts</span>
                <span className="text-[10px] text-cyan-400 font-mono">{notifications.length} recent</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-4">No recent alerts</p>
                ) : (
                  notifications.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300"
                    >
                      {msg}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / Operator Badge */}
        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-cyan-400/30">
            JM
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white flex items-center space-x-1">
              <span>Juma Mussa</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-300 font-medium">SUPER_ADMIN • NOC Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
