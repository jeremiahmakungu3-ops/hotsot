import React, { useState } from 'react';
import {
  Store,
  DollarSign,
  Printer,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  User,
  ShoppingBag,
  Award,
  Receipt
} from 'lucide-react';
import { Agent, Package, Voucher, Tenant } from '../types/index.ts';
import { sellVoucherPos } from '../lib/api.ts';

interface AgentPosViewProps {
  agents: Agent[];
  packages: Package[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const AgentPosView: React.FC<AgentPosViewProps> = ({
  agents,
  packages,
  currentTenant,
  onRefresh
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [cashGiven, setCashGiven] = useState<number>(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSoldVoucher, setLastSoldVoucher] = useState<Voucher | null>(null);
  const [lastCommission, setLastCommission] = useState<number>(0);

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const activePackage = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const changeDue = Math.max(0, (cashGiven || 0) - (activePackage?.price || 0));

  const handleSellVoucher = async () => {
    if (!activeAgent || !activePackage) return;
    setIsProcessing(true);
    try {
      const res = await sellVoucherPos(activeAgent.id, activePackage.id);
      setLastSoldVoucher(res.data.voucher);
      setLastCommission(res.data.commission);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="agent-pos-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              AGENT CASHIER TERMINAL
            </span>
            <span className="text-xs text-slate-400 font-mono">Fast POS • Instant Commission • 58mm Receipt</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Agent & Kiosk Point of Sale (POS)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid cash checkout for physical agents, street resellers, and hotel reception desks.
          </p>
        </div>

        {/* Agent Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <User className="w-4 h-4 text-emerald-400 ml-2" />
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-slate-950 border-none rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer font-semibold"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.fullName} ({agent.location}) — Balance: TZS {agent.walletBalance.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* POS Cashier Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Package Grid & Instant Checkout */}
        <div className="lg:col-span-2 space-y-5">
          {/* Agent Stats Strip */}
          {activeAgent && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Agent Float Wallet</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  TZS {activeAgent.walletBalance.toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Total Sales</span>
                <span className="text-lg font-black text-white font-mono">
                  TZS {activeAgent.totalSales.toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Commission Rate</span>
                <span className="text-lg font-black text-amber-400 font-mono flex items-center">
                  <Award className="w-4 h-4 mr-1 text-amber-400" />
                  {activeAgent.commissionRate}%
                </span>
              </div>
            </div>
          )}

          {/* Package Quick Selection Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Step 1: Select WiFi Package</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      setSelectedPackageId(pkg.id);
                      setCashGiven(pkg.price);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-sm text-white block">{pkg.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Speed: {pkg.mikrotikRateLimit}
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        TZS {pkg.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span>Uptime: {pkg.durationSeconds / 3600} Hours</span>
                      <span className="text-amber-400 font-semibold">
                        Agent Earns: TZS {((pkg.price * (activeAgent?.commissionRate || 10)) / 100).toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment & Change Calculation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Collect Cash & Issue Voucher</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Package Price</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-base font-black text-white font-mono">
                  TZS {(activePackage?.price || 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Cash Received (TZS)</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-base font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Change Due</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-base font-black text-cyan-400 font-mono">
                  TZS {changeDue.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              id="btn-pos-issue-voucher"
              onClick={handleSellVoucher}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isProcessing ? 'Generating Voucher Ticket...' : 'Complete Cash Sale & Issue Voucher'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Instant Thermal Receipt Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm text-white">Live Thermal Receipt</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ESC/POS 58mm</span>
            </div>

            {lastSoldVoucher ? (
              <div className="mt-4 bg-white text-slate-900 rounded-xl p-5 shadow-lg border border-slate-200 space-y-4 font-mono text-xs">
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <div className="font-black text-base tracking-tight text-slate-900">
                    {currentTenant?.name || 'DarNet HotSpot'}
                  </div>
                  <div className="text-[10px] text-slate-500">Kariakoo Agent POS Terminal</div>
                  <div className="text-[9px] text-slate-400 mt-1">{new Date().toLocaleString()}</div>
                </div>

                {/* Ticket Details */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Plan:</span>
                    <span className="font-bold">{lastSoldVoucher.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Speed:</span>
                    <span>{lastSoldVoucher.packageRateLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount Paid:</span>
                    <span className="font-black text-slate-900">
                      TZS {(lastSoldVoucher.packagePrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Voucher Code Box */}
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block">LOGIN CODE</span>
                  <div className="text-lg font-black text-slate-900 tracking-wider">
                    {lastSoldVoucher.code}
                  </div>
                  {lastSoldVoucher.pin && (
                    <div className="text-xs text-slate-700">
                      PIN: <strong>{lastSoldVoucher.pin}</strong>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-center text-slate-500 leading-tight">
                  Connect to WiFi & enter Code on captive portal. Thank you!
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs space-y-2">
                <Printer className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Complete a sale on the left to generate the instant thermal receipt.</p>
              </div>
            )}
          </div>

          {lastCommission > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <span>Commission credited to wallet:</span>
              <span className="font-black font-mono">TZS {lastCommission.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
