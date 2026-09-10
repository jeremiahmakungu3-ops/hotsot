import React, { useState } from 'react';
import {
  SmartphoneNfc,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Zap,
  Send,
  RefreshCw,
  CreditCard,
  Building,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Payment, Package, Tenant } from '../types/index.ts';
import { initiatePayment, triggerPaymentWebhook } from '../lib/api.ts';

interface PaymentsViewProps {
  payments: Payment[];
  packages: Package[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  packages,
  currentTenant,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('+255 754 123 456');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [customerName, setCustomerName] = useState('Salim Rashid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) => {
    return (
      searchQuery === '' ||
      p.paymentReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneNumber.includes(searchQuery) ||
      (p.providerTxId && p.providerTxId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.customerName && p.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleSendStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPushStatusMessage(null);
    try {
      const res = await initiatePayment({
        tenantId: currentTenant?.id,
        customerName,
        packageId: selectedPackageId,
        phoneNumber,
        method: selectedMethod
      });

      setPushStatusMessage(
        res.data?.ussdPromptMessage ||
          `STK Push initiated successfully for ${selectedMethod} on ${phoneNumber}.`
      );
      onRefresh();
    } catch (err) {
      console.error(err);
      setPushStatusMessage('Error initiating Mobile Money request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateWebhookSuccess = async (payment: Payment) => {
    try {
      await triggerPaymentWebhook({
        paymentReference: payment.paymentReference,
        status: 'COMPLETED',
        providerTxId: `${payment.method}-AUTO-VERIFIED`
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="payments-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              TANZANIA MOBILE MONEY GATEWAY
            </span>
            <span className="text-xs text-slate-400 font-mono">M-Pesa • Airtel • Tigo (Mixx) • Selcom</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Mobile Money & Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            USSD STK Push integration, HMAC SHA-256 webhook validation, and instant automated voucher release.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* STK Push Test Box & Gateway Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Push Simulator */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <SmartphoneNfc className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">Initiate Mobile Money Push</h2>
          </div>

          <form onSubmit={handleSendStkPush} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Mobile Money Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'MPESA', label: 'Vodacom M-Pesa' },
                  { id: 'AIRTEL_MONEY', label: 'Airtel Money' },
                  { id: 'TIGO_PESA', label: 'Tigo Pesa (Mixx)' },
                  { id: 'SELCOM', label: 'Selcom Pay' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMethod(item.id)}
                    className={`py-2 px-2.5 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                      selectedMethod === item.id
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Guest / Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Phone Number (+255)</label>
              <input
                type="text"
                required
                placeholder="+255 7XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Select Internet Package</label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — TZS {pkg.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending USSD Prompt...' : 'Send USSD Prompt'}</span>
            </button>
          </form>

          {pushStatusMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>USSD Request Dispatched</span>
              </div>
              <p>{pushStatusMessage}</p>
            </div>
          )}
        </div>

        {/* Payment Methods Status Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-sm text-white">Payment Gateway Health & Status</h2>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-semibold">ALL OPERATIONAL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Vodacom M-Pesa C2B / STK</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Shortcode: 881290 (DarNet Hotspot)</p>
                <div className="text-[10px] text-slate-500">Avg Confirmation: 2.4 seconds</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Airtel Money Push</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Merchant ID: 440192</p>
                <div className="text-[10px] text-slate-500">Avg Confirmation: 3.1 seconds</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Tigo Pesa (Mixx API)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Biller ID: 70912</p>
                <div className="text-[10px] text-slate-500">Avg Confirmation: 2.8 seconds</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Selcom Pay Master</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Unified Gateway (Banks & Mobile)</p>
                <div className="text-[10px] text-slate-500">SHA-256 Webhook Verification: Active</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
              Webhook endpoint: <code>/api/v1/payments/webhook</code>
            </span>
            <span className="font-mono text-[10px] text-cyan-400">HMAC-SHA256</span>
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, customer, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total recorded: <strong className="text-white">{filteredPayments.length}</strong> transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Reference No.</th>
                <th className="py-3.5 px-4">Provider & TxID</th>
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Purchased Package</th>
                <th className="py-3.5 px-4">Amount (TZS)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Quick Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {p.paymentReference}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                      {p.method}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {p.providerTxId || 'Pending'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{p.customerName || 'Guest User'}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.phoneNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {p.packageName || 'Internet Voucher'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    TZS {p.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                    {new Date(p.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleSimulateWebhookSuccess(p)}
                        className="px-2 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                        title="Simulate Instant Callback"
                      >
                        Approve
                      </button>
                    )}
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
