import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Key,
  Shield,
  CreditCard
} from 'lucide-react';
import { Customer, Tenant } from '../types/index.ts';
import { createCustomer } from '../lib/api.ts';

interface CustomersViewProps {
  customers: Customer[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  currentTenant,
  onRefresh
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+255 7');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Kinondoni, Dar es Salaam');
  const [pppoeUsername, setPppoeUsername] = useState('');
  const [pppoePassword, setPppoePassword] = useState('fiber_pass_2026');

  const filteredCustomers = customers.filter((c) => {
    return (
      searchQuery === '' ||
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      c.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.pppoeUsername && c.pppoeUsername.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createCustomer({
        fullName,
        phoneNumber,
        email,
        address,
        pppoeUsername: pppoeUsername || fullName.toLowerCase().replace(/\s+/g, '_'),
        pppoePassword,
        tenantId: currentTenant?.id
      });
      setShowAddModal(false);
      setFullName('');
      setEmail('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="customers-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
              PPPOE & HOTSPOT SUBSCRIBERS
            </span>
            <span className="text-xs text-slate-400 font-mono">Radius Auth • Static IPs • CRM Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Customers & Subscribers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage residential fiber PPPoE accounts, corporate leased lines, and VIP guest profiles.
          </p>
        </div>

        <button
          id="btn-add-customer-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscriber</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subscriber name, account #, phone, or PPPoE user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Total Subscribers: <strong className="text-white">{filteredCustomers.length}</strong>
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Account No.</th>
                <th className="py-3.5 px-4">Subscriber Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">PPPoE Credentials</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {cust.accountNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {cust.fullName}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 space-y-0.5">
                    <div className="flex items-center text-slate-300">
                      <Phone className="w-3 h-3 text-cyan-400 mr-1" />
                      {cust.phoneNumber}
                    </div>
                    {cust.email && (
                      <div className="flex items-center text-slate-400">
                        <Mail className="w-3 h-3 text-slate-500 mr-1" />
                        {cust.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-cyan-300 font-bold">{cust.pppoeUsername || 'N/A'}</div>
                    <div className="text-slate-500 text-[10px]">pass: {cust.pppoePassword || '••••'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {cust.address || 'Dar es Salaam'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    TZS {cust.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                        cust.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {cust.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Subscriber */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Enroll New Subscriber</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name / Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanzania Tech Hub Ltd"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+255 754 123 456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="billing@techhub.co.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">PPPoE Username</label>
                  <input
                    type="text"
                    placeholder="techhub_fiber"
                    value={pppoeUsername}
                    onChange={(e) => setPppoeUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">PPPoE Secret / Password</label>
                  <input
                    type="text"
                    value={pppoePassword}
                    onChange={(e) => setPppoePassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Installation Address</label>
                <input
                  type="text"
                  placeholder="Plot 42, Ali Hassan Mwinyi Rd, Dar es Salaam"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1 cursor-pointer"
                >
                  {isLoading ? 'Creating Subscriber...' : 'Save Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
