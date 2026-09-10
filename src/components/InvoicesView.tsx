import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Invoice, Tenant } from '../types/index.ts';

interface InvoicesViewProps {
  invoices: Invoice[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ invoices, currentTenant, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    return (
      searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div id="invoices-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
              TAX INVOICES & RECURRING BILLING
            </span>
            <span className="text-xs text-slate-400 font-mono">18% VAT (TRA EFD Compliant) • Monthly Fiber</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Invoices & Billing Statements
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated monthly invoices for PPPoE and corporate fiber leases.
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total Invoices: <strong className="text-white">{filteredInvoices.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Invoice No.</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Subtotal (TZS)</th>
                <th className="py-3.5 px-4">VAT 18%</th>
                <th className="py-3.5 px-4">Total Due</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {inv.customerName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    TZS {inv.subtotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    TZS {inv.taxAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    TZS {inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Preview PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: PDF Invoice Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  Invoice Statement: {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Render Printable Invoice */}
            <div className="flex-1 bg-white text-slate-900 rounded-xl p-6 shadow-md border border-slate-200 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-black text-cyan-700">
                    {currentTenant?.name || 'DarNet HighSpeed ISP'}
                  </h1>
                  <p className="text-xs text-slate-500">TIN: 140-992-108 • VRN: 40019283-Z</p>
                  <p className="text-xs text-slate-500">Ali Hassan Mwinyi Rd, Dar es Salaam, Tanzania</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-slate-800 block">TAX INVOICE</span>
                  <span className="text-xs font-mono text-slate-500">{selectedInvoice.invoiceNumber}</span>
                  <div className="mt-2 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                    STATUS: {selectedInvoice.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block">BILLED TO:</span>
                  <div className="font-bold text-slate-800 text-sm">{selectedInvoice.customerName}</div>
                  <div className="text-slate-600">Subscriber Account: DAR-CUST-8812</div>
                  <div className="text-slate-600">Kinondoni, Dar es Salaam</div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500">Invoice Date:</span>{' '}
                    <span className="font-mono">{selectedInvoice.createdAt.split('T')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Due Date:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">{selectedInvoice.dueDate}</span>
                  </div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Rate (TZS)</th>
                    <th className="p-2.5 text-right">Amount (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5">
                      <div className="font-bold">Monthly Dedicated Fiber 20Mbps</div>
                      <div className="text-[10px] text-slate-500">Full Unlimited Symmetrical Bandwidth with 99.9% SLA</div>
                    </td>
                    <td className="p-2.5 text-right font-mono">1</td>
                    <td className="p-2.5 text-right font-mono">{selectedInvoice.subtotal.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{selectedInvoice.subtotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>TZS {selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (18%):</span>
                    <span>TZS {selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-1.5">
                    <span>Total Due:</span>
                    <span>TZS {selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 text-center">
                Payment Options: Lipa Namba M-Pesa (881290) • CRDB Bank A/C: 01509928190 • Selcom Pay
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
