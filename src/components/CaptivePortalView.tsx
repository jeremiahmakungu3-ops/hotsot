import React, { useState } from 'react';
import {
  Globe2,
  Wifi,
  SmartphoneNfc,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Package, Tenant, Voucher } from '../types/index.ts';
import { redeemVoucher, initiatePayment } from '../lib/api.ts';

interface CaptivePortalViewProps {
  packages: Package[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const CaptivePortalView: React.FC<CaptivePortalViewProps> = ({
  packages,
  currentTenant,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'buy' | 'status'>('voucher');
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeVoucherSession, setActiveVoucherSession] = useState<Voucher | null>(null);

  // Buy flow states
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || '');
  const [phoneNumber, setPhoneNumber] = useState('+255 754 123 456');
  const [selectedMethod, setSelectedMethod] = useState('MPESA');
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const handleConnectVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    try {
      const voucher = await redeemVoucher(voucherCode);
      setActiveVoucherSession(voucher);
      setActiveTab('status');
      onRefresh();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Voucher code or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await initiatePayment({
        tenantId: currentTenant?.id,
        packageId: selectedPkgId,
        phoneNumber,
        method: selectedMethod
      });
      setPaymentInitiated(true);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="captive-portal-view" className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
              MIKROTIK CAPTIVE PORTAL SIMULATOR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              HTTP-CHAP • PAP • Mobile Money Integration
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            HotSpot Guest Login Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            This is the live landing screen your guests see when connecting to WiFi in hotels, cafes, malls, or airports.
          </p>
        </div>
      </div>

      {/* Interactive Mobile Smartphone / Tablet Mockup */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-tr from-slate-900 via-cyan-950 to-blue-900 text-white p-6 text-center space-y-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 shadow-lg">
              <Wifi className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black tracking-tight">{currentTenant?.name || 'DarNet HighSpeed WiFi'}</h2>
            <p className="text-xs text-cyan-200/80 font-medium">Welcome! High-Speed Internet Access</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('voucher')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                activeTab === 'voucher'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Enter Voucher
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                activeTab === 'buy'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Buy with M-Pesa
            </button>
            {activeVoucherSession && (
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'status'
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Session Status
              </button>
            )}
          </div>

          {/* Content Body */}
          <div className="p-6">
            {activeTab === 'voucher' && (
              <form onSubmit={handleConnectVoucher} className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-base text-slate-800">Have a Voucher Code or PIN?</h3>
                  <p className="text-xs text-slate-500">Enter the code printed on your receipt or voucher card.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Voucher Code / PIN</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KLI-8921-4829 or 4491"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-center font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-500 tracking-wider uppercase"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating with RADIUS...' : 'Connect to Internet'}</span>
                </button>
              </form>
            )}

            {activeTab === 'buy' && (
              <form onSubmit={handleInitiateBuy} className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-base text-slate-800">Instant Mobile Money Purchase</h3>
                  <p className="text-xs text-slate-500">Select a package and pay via USSD STK push.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Select Internet Plan</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          selectedPkgId === pkg.id
                            ? 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{pkg.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Speed: {pkg.mikrotikRateLimit}
                          </div>
                        </div>
                        <span className="font-black text-emerald-600 font-mono text-xs">
                          TZS {pkg.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['MPESA', 'AIRTEL_MONEY', 'TIGO_PESA', 'SELCOM'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMethod(m)}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          selectedMethod === m
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Your Mobile Number (+255)</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {paymentInitiated ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 space-y-1">
                    <div className="font-bold flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      USSD Push Sent to Handset!
                    </div>
                    <p className="text-[11px]">Enter your PIN on your phone to activate WiFi automatically.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    <span>Pay with Mobile Money</span>
                  </button>
                )}
              </form>
            )}

            {activeTab === 'status' && activeVoucherSession && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">Connected & Authorized!</h3>
                  <p className="text-xs text-slate-500">Your device is authenticated on MikroTik RouterOS.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Voucher Code:</span>
                    <span className="font-mono font-bold text-slate-900">{activeVoucherSession.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan:</span>
                    <span className="font-bold text-slate-900">{activeVoucherSession.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Speed Allocation:</span>
                    <span className="font-mono font-bold text-cyan-600">
                      {activeVoucherSession.packageRateLimit}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Enjoy your browsing! To log out, visit <code>http://logout</code> or <code>10.100.1.1/logout</code>.
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="bg-slate-100 p-3 text-center border-t border-slate-200 text-[10px] text-slate-500">
            Powered by <strong>XCLOUD.NET</strong> HotSpot Cloud
          </div>
        </div>
      </div>
    </div>
  );
};
