import React, { useState } from 'react';
import {
  Settings,
  Building,
  Smartphone,
  Globe,
  Key,
  Save,
  CheckCircle2,
  Shield,
  Send
} from 'lucide-react';
import { Tenant } from '../types/index.ts';

interface SettingsViewProps {
  currentTenant: Tenant | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTenant }) => {
  const [tenantName, setTenantName] = useState(currentTenant?.name || 'DarNet HighSpeed ISP');
  const [currency, setCurrency] = useState(currentTenant?.currency || 'TZS');
  const [vatRate, setVatRate] = useState(18);
  const [smsProvider, setSmsProvider] = useState('BEEM_AFRICA');
  const [smsApiKey, setSmsApiKey] = useState('beem_live_sec_9918237192837');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div id="settings-view" className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold">
              TENANT & GATEWAY SETTINGS
            </span>
            <span className="text-xs text-slate-400 font-mono">SMS • Webhooks • Walled Garden</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            System & Tenant Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage ISP company branding, SMS gateway integration for voucher delivery, and Walled Garden lists.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ISP Business Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Building className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">ISP Organization & Tax Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="TZS">Tanzanian Shilling (TZS)</option>
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Default Tax / VAT (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Country</label>
              <input
                type="text"
                disabled
                value="Tanzania (+255)"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* SMS & WhatsApp Gateway */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">SMS Notification Gateway (Voucher PIN Delivery)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMS Provider</label>
              <select
                value={smsProvider}
                onChange={(e) => setSmsProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="BEEM_AFRICA">Beem Africa (Tanzania Direct DLR)</option>
                <option value="INFOBIP">Infobip Enterprise</option>
                <option value="TWILIO">Twilio Global SMS</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">API Key / Secret</label>
              <input
                type="password"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Walled Garden Domains */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-white">Walled Garden Whitelisted Domains</h2>
          </div>

          <p className="text-xs text-slate-400">
            These domains are automatically added to MikroTik RouterOS walled garden rules for free captive checkout:
          </p>

          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-indigo-300 space-y-1">
            <div>*.vodacom.co.tz (M-Pesa Gateway)</div>
            <div>*.airtel.co.tz (Airtel Money API)</div>
            <div>*.tigo.co.tz (Tigo Pesa Mixx)</div>
            <div>*.selcompay.com (Selcom Master)</div>
            <div>*.xcloud.net (Central Cloud Telemetry)</div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center font-semibold animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Tenant Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
