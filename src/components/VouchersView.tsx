import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Printer,
  FileSpreadsheet,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Copy,
  Download,
  Wifi,
  Sparkles,
  Zap
} from 'lucide-react';
import { Voucher, VoucherBatch, Package, Tenant } from '../types/index.ts';
import { generateVouchers, redeemVoucher, deletePackage } from '../lib/api.ts';

interface VouchersViewProps {
  vouchers: Voucher[];
  batches: VoucherBatch[];
  packages: Package[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const VouchersView: React.FC<VouchersViewProps> = ({
  vouchers,
  batches,
  packages,
  currentTenant,
  onRefresh
}) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedVouchersForPrint, setSelectedVouchersForPrint] = useState<Voucher[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states for voucher generation
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [prefix, setPrefix] = useState<string>('KLI');
  const [notes, setNotes] = useState<string>('Kariakoo agent batch');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await generateVouchers({
        packageId: selectedPackageId || packages[0].id,
        quantity: Number(quantity),
        prefix,
        notes,
        tenantId: currentTenant?.id
      });
      setShowGenerateModal(false);
      onRefresh();
      // Open print preview for newly generated vouchers
      setSelectedVouchersForPrint(res.data);
      setShowPrintModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.pin && v.pin.includes(searchQuery)) ||
      (v.packageName && v.packageName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCSV = () => {
    const header = 'Voucher Code,PIN,Package,Price TZS,Speed Limit,Duration (Seconds),Status,Created At\n';
    const rows = filteredVouchers
      .map(
        (v) =>
          `"${v.code}","${v.pin || ''}","${v.packageName || ''}",${v.packagePrice || 0},"${v.packageRateLimit || ''}",${v.packageDurationSeconds || 3600},"${v.status}","${v.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xcloud_vouchers_${currentTenant?.slug || 'isp'}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div id="vouchers-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
              HOTSPOT VOUCHER ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">Random PINs • QR Codes • Thermal Print</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Vouchers & Card Batches</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate, distribute, export, and track prepaid internet tokens across kiosks and agents.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-generate-voucher-modal"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Vouchers</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, PIN, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Statuses ({vouchers.length})</option>
            <option value="UNUSED">Unused</option>
            <option value="ACTIVE">Active (In Session)</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Showing <strong className="text-white">{filteredVouchers.length}</strong> vouchers</span>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Voucher Code</th>
                <th className="py-3.5 px-4">PIN</th>
                <th className="py-3.5 px-4">Package Plan</th>
                <th className="py-3.5 px-4">Speed Limit</th>
                <th className="py-3.5 px-4">Price (TZS)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Redeemed By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No vouchers found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center space-x-2">
                      <Ticket className="w-3.5 h-3.5 text-amber-400" />
                      <span>{v.code}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                      {v.pin || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {v.packageName || '3 Hours Standard'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {v.packageRateLimit || '5M/10M'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      TZS {(v.packagePrice || 1000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : v.status === 'UNUSED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            v.status === 'ACTIVE'
                              ? 'bg-emerald-400 animate-ping'
                              : v.status === 'UNUSED'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {v.redeemedByCustomer || v.redeemedMacAddress || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleCopy(v.code)}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVouchersForPrint([v]);
                            setShowPrintModal(true);
                          }}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Print Thermal Card"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Vouchers */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Generate HotSpot Vouchers</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Internet Package</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — TZS {pkg.price.toLocaleString()} ({pkg.mikrotikRateLimit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code Prefix</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. KLI, DAR"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Batch Tag / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kariakoo Market POS Batch #4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1 cursor-pointer"
                >
                  {isLoading ? 'Creating Tokens...' : `Generate ${quantity} Voucher(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Thermal Voucher Cards */}
      {showPrintModal && selectedVouchersForPrint.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  Voucher Thermal Print Preview ({selectedVouchersForPrint.length} cards)
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 custom-scrollbar">
              {selectedVouchersForPrint.map((v) => (
                <div
                  key={v.id}
                  className="bg-white text-slate-900 rounded-xl p-4 shadow-md border border-slate-200 flex flex-col justify-between space-y-3 font-sans relative overflow-hidden"
                >
                  {/* Top ISP Branding */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded bg-cyan-600 flex items-center justify-center text-white text-[10px] font-black">
                        X
                      </div>
                      <span className="font-extrabold text-xs tracking-tight text-slate-800">
                        {currentTenant?.name || 'DarNet HotSpot'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                      WiFi PASS
                    </span>
                  </div>

                  {/* Plan Specs */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">{v.packageName || '3 Hours Standard'}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>Speed: {v.packageRateLimit || '5M/10M'}</span>
                      <span className="font-bold text-emerald-600">TZS {(v.packagePrice || 1000).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Code & PIN Box */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-center space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Voucher Username / Code
                    </span>
                    <div className="font-mono text-base font-black text-slate-900 tracking-wider">
                      {v.code}
                    </div>
                    {v.pin && (
                      <div className="text-[10px] font-mono text-slate-600">
                        PIN: <strong className="text-slate-900">{v.pin}</strong>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="text-[9px] text-slate-500 text-center leading-tight">
                    Connect to WiFi & enter Code or PIN on login page.
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ready for standard 58mm / 80mm ESC/POS thermal printers or PDF print.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Printer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
