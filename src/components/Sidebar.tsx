import React from 'react';
import {
  LayoutDashboard,
  Router,
  Ticket,
  PackageCheck,
  Radio,
  SmartphoneNfc,
  Store,
  Users,
  Receipt,
  Server,
  BarChart3,
  ShieldAlert,
  Globe2,
  UserCheck,
  Settings,
  Flame,
  ChevronRight,
  Wifi,
  Sparkles
} from 'lucide-react';
import { Tenant } from '../types/index.ts';

export type NavTab =
  | 'dashboard'
  | 'routers'
  | 'onboarding'
  | 'vouchers'
  | 'packages'
  | 'sessions'
  | 'payments'
  | 'agents'
  | 'customers'
  | 'invoices'
  | 'radius'
  | 'reports'
  | 'audit'
  | 'captive-portal'
  | 'customer-portal'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onSelectTenant: (tenant: Tenant) => void;
  wsConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  tenants,
  selectedTenant,
  onSelectTenant,
  wsConnected
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Admin Dashboard', icon: LayoutDashboard, category: 'CORE' },
    { id: 'routers' as NavTab, label: 'MikroTik Routers', icon: Router, category: 'NETWORK', badge: 'v7 API' },
    { id: 'onboarding' as NavTab, label: 'Router Onboarding', icon: Sparkles, category: 'NETWORK', badge: '1-Click' },
    { id: 'sessions' as NavTab, label: 'Live Sessions (CoA)', icon: Radio, category: 'NETWORK', badge: 'Live' },
    { id: 'radius' as NavTab, label: 'FreeRADIUS & Health', icon: Server, category: 'NETWORK' },
    { id: 'packages' as NavTab, label: 'Packages & Tariffs', icon: PackageCheck, category: 'BILLING' },
    { id: 'vouchers' as NavTab, label: 'Vouchers & Batches', icon: Ticket, category: 'BILLING' },
    { id: 'payments' as NavTab, label: 'Mobile Money & Webhooks', icon: SmartphoneNfc, category: 'BILLING', badge: 'TZS' },
    { id: 'agents' as NavTab, label: 'Agent POS Terminal', icon: Store, category: 'COMMERCE', badge: 'Fast POS' },
    { id: 'customers' as NavTab, label: 'Subscribers & PPPoE', icon: Users, category: 'CUSTOMERS' },
    { id: 'invoices' as NavTab, label: 'Invoices & Billing', icon: Receipt, category: 'CUSTOMERS' },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3, category: 'ANALYTICS' },
    { id: 'audit' as NavTab, label: 'Security & Audit Logs', icon: ShieldAlert, category: 'ANALYTICS' },
    { id: 'captive-portal' as NavTab, label: 'HotSpot Captive Portal', icon: Globe2, category: 'PORTALS', badge: 'MikroTik' },
    { id: 'customer-portal' as NavTab, label: 'Customer Self-Service', icon: UserCheck, category: 'PORTALS' },
    { id: 'settings' as NavTab, label: 'Tenant & SMS Settings', icon: Settings, category: 'SETTINGS' }
  ];

  const categories = ['CORE', 'NETWORK', 'BILLING', 'COMMERCE', 'CUSTOMERS', 'ANALYTICS', 'PORTALS', 'SETTINGS'];

  return (
    <aside
      id="xcloud-sidebar"
      className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 selection:bg-cyan-500 selection:text-white"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-wider">
            <Wifi className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">XCLOUD</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-semibold">.NET</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">ISP & Hotspot Billing Cloud</p>
          </div>
        </div>
      </div>

      {/* Tenant Switcher */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Active ISP Tenant
        </label>
        <select
          id="tenant-select-dropdown"
          value={selectedTenant?.id || ''}
          onChange={(e) => {
            const t = tenants.find((item) => item.id === e.target.value);
            if (t) onSelectTenant(t);
          }}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors font-medium cursor-pointer"
        >
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name} ({tenant.country})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links with Category Grouping */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {categories.map((category) => {
          const items = navItems.filter((i) => i.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                {category}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-300 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            item.badge === 'Live'
                              ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                              : item.badge === 'Fast POS'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Real-time Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400 font-medium">
            {wsConnected ? 'Live Stream Active' : 'Disconnected'}
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">v2.4-PROD</span>
      </div>
    </aside>
  );
};
