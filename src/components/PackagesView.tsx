import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Trash2,
  Clock,
  Zap,
  Layers,
  ArrowUpRight,
  Shield,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { Package, Tenant } from '../types/index.ts';
import { createPackage, deletePackage } from '../lib/api.ts';

interface PackagesViewProps {
  packages: Package[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({ packages, currentTenant, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'HOTSPOT_TIME' | 'HOTSPOT_DATA' | 'PPPOE_MONTHLY'>('HOTSPOT_TIME');
  const [price, setPrice] = useState<number>(1000);
  const [durationSeconds, setDurationSeconds] = useState<number>(3600);
  const [validityDays, setValidityDays] = useState<number>(1);
  const [uploadKbps, setUploadKbps] = useState<number>(5120);
  const [downloadKbps, setDownloadKbps] = useState<number>(10240);
  const [simultaneousSessions, setSimultaneousSessions] = useState<number>(1);
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const upM = Math.floor(uploadKbps / 1024);
      const downM = Math.floor(downloadKbps / 1024);
      const mikrotikRateLimit = `${upM}M/${downM}M`;

      await createPackage({
        name,
        type,
        price: Number(price),
        currency: 'TZS',
        durationSeconds: Number(durationSeconds),
        validityDays: Number(validityDays),
        uploadSpeedKbps: Number(uploadKbps),
        downloadSpeedKbps: Number(downloadKbps),
        simultaneousSessions: Number(simultaneousSessions),
        mikrotikRateLimit,
        description,
        tenantId: currentTenant?.id
      });
      setShowAddModal(false);
      setName('');
      setDescription('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this internet package?')) {
      await deletePackage(id);
      onRefresh();
    }
  };

  return (
    <div id="packages-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
              BANDWIDTH & TARIFF CONTROL
            </span>
            <span className="text-xs text-slate-400 font-mono">MikroTik Rate-Limits • Bursting • FUP</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Packages & Pricing Tariffs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure prepaid HotSpot time/data vouchers and monthly PPPoE fiber subscriptions.
          </p>
        </div>

        <button
          id="btn-add-package-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            id={`package-card-${pkg.id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                    {pkg.type.replace('_', ' ')}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1.5">{pkg.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    TZS {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">incl. 18% VAT</span>
                </div>
              </div>

              {pkg.description && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
              )}

              {/* Specs Box */}
              <div className="mt-4 bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> Speed Allocation
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{pkg.mikrotikRateLimit}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Active Uptime
                  </span>
                  <span className="font-medium text-slate-200">
                    {pkg.durationSeconds >= 86400
                      ? `${pkg.durationSeconds / 86400} Days`
                      : `${pkg.durationSeconds / 3600} Hours`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 mr-1.5" /> Max Devices
                  </span>
                  <span className="font-medium text-slate-200">{pkg.simultaneousSessions} device(s)</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                MikroTik VSA: {pkg.mikrotikRateLimit}
              </span>
              <button
                onClick={() => handleDelete(pkg.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                title="Delete Package"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Package */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Create New Tariff Plan</h3>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 Hours Ultra Fast WiFi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Plan Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HOTSPOT_TIME">Hotspot (Time-Based)</option>
                    <option value="HOTSPOT_DATA">Hotspot (Data-Capped)</option>
                    <option value="PPPOE_MONTHLY">PPPoE Fiber (Monthly)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Upload Speed (Kbps)</label>
                  <input
                    type="number"
                    value={uploadKbps}
                    onChange={(e) => setUploadKbps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Download Speed (Kbps)</label>
                  <input
                    type="number"
                    value={downloadKbps}
                    onChange={(e) => setDownloadKbps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Session Duration (Seconds)</label>
                  <input
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Simultaneous Devices</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={simultaneousSessions}
                    onChange={(e) => setSimultaneousSessions(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Marketing Description</label>
                <input
                  type="text"
                  placeholder="e.g. Ultra HD 4K streaming and low-ping gaming"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1 cursor-pointer"
                >
                  {isLoading ? 'Creating...' : 'Save Tariff Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
