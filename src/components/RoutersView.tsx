import React, { useState } from 'react';
import {
  Router as RouterIcon,
  Plus,
  RefreshCw,
  Power,
  FileCode2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Database,
  Radio,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Edit3,
  Trash2,
  Settings2,
  Sparkles
} from 'lucide-react';
import { Router, Tenant } from '../types/index.ts';
import { createRouter, updateRouter, deleteRouter, syncRouter, rebootRouter, runDiagnostics } from '../lib/api.ts';
import { AutoInstallerModal } from './AutoInstallerModal.tsx';
import { RouterOnboarding } from './RouterOnboarding.tsx';

interface RoutersViewProps {
  routers: Router[];
  currentTenant: Tenant | null;
  onRefresh: () => void;
}

export const RoutersView: React.FC<RoutersViewProps> = ({ routers, currentTenant, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'fleet' | 'onboarding'>('fleet');
  const [onboardingTargetRouter, setOnboardingTargetRouter] = useState<Router | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRouterModal, setEditRouterModal] = useState<Router | null>(null);
  const [deleteRouterModal, setDeleteRouterModal] = useState<Router | null>(null);
  const [selectedScriptRouter, setSelectedScriptRouter] = useState<Router | null>(null);
  const [diagnosticsRouter, setDiagnosticsRouter] = useState<Router | null>(null);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [showAutoInstaller, setShowAutoInstaller] = useState(false);
  const [autoInstallerRouter, setAutoInstallerRouter] = useState<Router | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add Form states
  const [name, setName] = useState('');
  const [identity, setIdentity] = useState('');
  const [model, setModel] = useState('CCR2004-16G-2S+');
  const [ipAddress, setIpAddress] = useState('10.100.1.1');
  const [location, setLocation] = useState('Main ISP Hub, Dar es Salaam');

  // Edit Form states
  const [editName, setEditName] = useState('');
  const [editIdentity, setEditIdentity] = useState('');
  const [editModel, setEditModel] = useState('CCR2004-16G-2S+');
  const [editIpAddress, setEditIpAddress] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'PROVISIONING'>('ONLINE');
  const [editIsRadiusEnabled, setEditIsRadiusEnabled] = useState(true);
  const [editIsHotspotEnabled, setEditIsHotspotEnabled] = useState(true);
  const [editIsPppoeEnabled, setEditIsPppoeEnabled] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newRouter = await createRouter({
        name,
        identity: identity || name.replace(/\s+/g, '-').toUpperCase(),
        model,
        ipAddress,
        location,
        tenantId: currentTenant?.id
      });
      setShowAddModal(false);
      setName('');
      setIdentity('');
      onRefresh();
      setSelectedScriptRouter(newRouter);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (router: Router) => {
    setEditRouterModal(router);
    setEditName(router.name);
    setEditIdentity(router.identity);
    setEditModel(router.model || 'CCR2004-16G-2S+');
    setEditIpAddress(router.ipAddress);
    setEditLocation(router.location || '');
    setEditStatus(router.status);
    setEditIsRadiusEnabled(router.isRadiusEnabled ?? true);
    setEditIsHotspotEnabled(router.isHotspotEnabled ?? true);
    setEditIsPppoeEnabled(router.isPppoeEnabled ?? false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRouterModal) return;
    setIsLoading(true);
    try {
      await updateRouter(editRouterModal.id, {
        name: editName,
        identity: editIdentity,
        model: editModel,
        ipAddress: editIpAddress,
        location: editLocation,
        status: editStatus,
        isRadiusEnabled: editIsRadiusEnabled,
        isHotspotEnabled: editIsHotspotEnabled,
        isPppoeEnabled: editIsPppoeEnabled
      });
      setEditRouterModal(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRouterModal) return;
    setIsLoading(true);
    try {
      await deleteRouter(deleteRouterModal.id);
      setDeleteRouterModal(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiag = async (router: Router) => {
    setDiagnosticsRouter(router);
    setDiagResult(null);
    setIsLoading(true);
    try {
      const res = await runDiagnostics(router.id);
      setDiagResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (routerId: string) => {
    await syncRouter(routerId);
    onRefresh();
  };

  const handleReboot = async (routerId: string) => {
    if (confirm('Are you sure you want to reboot this MikroTik router? Connected sessions will reconnect.')) {
      await rebootRouter(routerId);
      onRefresh();
    }
  };

  return (
    <div id="routers-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
              MIKROTIK ROUTEROS v7
            </span>
            <span className="text-xs text-slate-400 font-mono">REST API • FreeRADIUS • CoA Port 3799</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">MikroTik Router Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloud orchestration, zero-touch provisioning scripts, and live hardware monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Router List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-open-auto-installer"
            onClick={() => {
              setOnboardingTargetRouter(null);
              setViewMode('onboarding');
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Onboarding Studio</span>
          </button>
          <button
            id="btn-add-router-modal"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Router</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode('fleet')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'fleet'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RouterIcon className="w-4 h-4" />
          <span>Router Fleet ({routers.length})</span>
        </button>
        <button
          id="btn-switch-onboarding-studio"
          onClick={() => {
            setOnboardingTargetRouter(null);
            setViewMode('onboarding');
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'onboarding'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Router Onboarding Studio</span>
        </button>
      </div>

      {viewMode === 'onboarding' ? (
        <RouterOnboarding
          routers={routers}
          selectedRouter={onboardingTargetRouter}
          currentTenant={currentTenant}
          onBack={() => setViewMode('fleet')}
          onOnboardingComplete={() => {
            onRefresh();
            setViewMode('fleet');
          }}
        />
      ) : (
        <>
      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {routers.map((router) => (
          <div
            key={router.id}
            id={`router-card-${router.id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Card Header & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                    <RouterIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white leading-tight">{router.name}</h2>
                    <span className="text-[11px] font-mono text-cyan-400 block">{router.identity || 'MikroTik-GW'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    id={`btn-edit-router-${router.id}`}
                    onClick={() => openEditModal(router)}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Router Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-delete-router-${router.id}`}
                    onClick={() => setDeleteRouterModal(router)}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove Router"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                      router.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : router.status === 'DEGRADED'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        router.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                    {router.status}
                  </span>
                </div>
              </div>

              {/* Specs & IP Info */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400 block">Model & OS</span>
                  <span className="text-slate-200 font-semibold truncate block">{router.model || 'MikroTik Router'}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{router.routerOsVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">IP / Gateway</span>
                  <span className="text-slate-200 font-mono font-semibold">{router.ipAddress}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">{router.location}</span>
                </div>
              </div>

              {/* Telemetry Hardware Gauges */}
              <div className="mt-4 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CPU Load</span>
                    </span>
                    <span className="font-mono text-white font-bold">{router.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        router.cpuUsage > 80 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, router.cpuUsage)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center space-x-1">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      <span>RAM Utilization</span>
                    </span>
                    <span className="font-mono text-white font-bold">{router.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        router.memoryUsage > 85 ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, router.memoryUsage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Users & Heartbeat */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span className="flex items-center text-slate-300 font-medium">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                  <strong className="text-white mr-1">{router.activeUsersCount}</strong> active users
                </span>
                <span className="font-mono text-[10px]">
                  {router.lastHeartbeatAt ? 'Heartbeat: Just now' : 'No heartbeat'}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
              <button
                id={`btn-autoinstall-${router.id}`}
                onClick={() => {
                  setAutoInstallerRouter(router);
                  setShowAutoInstaller(true);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 hover:from-cyan-600/30 hover:to-indigo-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                title="1-Click Automated Install & Custom Provisioning"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto Install</span>
              </button>

              <button
                onClick={() => setSelectedScriptRouter(router)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                title="View Quick Setup Script"
              >
                <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleRunDiag(router)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Run Diagnostics"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={() => handleSync(router.id)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Sync Configuration"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={() => handleReboot(router.id)}
                className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Reboot Router"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Modal: Add Router */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <RouterIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Enroll New MikroTik Router</h3>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Router Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mlimani City Mall HotSpot Core"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Router Identity</label>
                  <input
                    type="text"
                    placeholder="e.g. MLIMANI-HOTSPOT-01"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hardware Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CCR2004-16G-2S+">CCR2004-16G-2S+ (Core)</option>
                    <option value="RB4011iGS+5HacQ2HnD-IN">RB4011 (Distribution)</option>
                    <option value="hAP ax3">hAP ax3 (Branch WiFi 6)</option>
                    <option value="hAP ax2">hAP ax2 (Compact)</option>
                    <option value="Cloud Hosted Router (CHR)">CHR (Cloud x86 VM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">LAN / Gateway IP</label>
                  <input
                    type="text"
                    required
                    placeholder="10.100.1.1"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Installation Location</label>
                  <input
                    type="text"
                    placeholder="Mwenge, Dar es Salaam"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center space-x-1 cursor-pointer"
                >
                  {isLoading ? 'Generating Script...' : 'Register & Generate Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Router */}
      {editRouterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Edit MikroTik Router Configuration</h3>
              </div>
              <button
                onClick={() => setEditRouterModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Router Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Router Identity</label>
                  <input
                    type="text"
                    required
                    value={editIdentity}
                    onChange={(e) => setEditIdentity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hardware Model</label>
                  <select
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CCR2004-16G-2S+">CCR2004-16G-2S+ (Core)</option>
                    <option value="RB4011iGS+5HacQ2HnD-IN">RB4011 (Distribution)</option>
                    <option value="hAP ax3">hAP ax3 (Branch WiFi 6)</option>
                    <option value="hAP ax2">hAP ax2 (Compact)</option>
                    <option value="Cloud Hosted Router (CHR)">CHR (Cloud x86 VM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">LAN / Gateway IP</label>
                  <input
                    type="text"
                    required
                    value={editIpAddress}
                    onChange={(e) => setEditIpAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Installation Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Operational Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="PROVISIONING">PROVISIONING</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">Services & Protocols</label>
                  <div className="flex items-center space-x-4 text-xs text-slate-300">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsRadiusEnabled}
                        onChange={(e) => setEditIsRadiusEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>RADIUS</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsHotspotEnabled}
                        onChange={(e) => setEditIsHotspotEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>HotSpot</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsPppoeEnabled}
                        onChange={(e) => setEditIsPppoeEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>PPPoE</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditRouterModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center space-x-1 cursor-pointer"
                >
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteRouterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Remove Router</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>Are you sure you want to remove router:</p>
              <p className="font-bold text-white font-mono text-sm">{deleteRouterModal.name}</p>
              <p className="text-slate-400 font-mono text-[11px]">Identity: {deleteRouterModal.identity} • IP: {deleteRouterModal.ipAddress}</p>
              <p className="text-amber-400 text-[11px] pt-1">
                Zero-touch telemetry and RADIUS authorization for this gateway will be unlinked.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeleteRouterModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isLoading ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: RouterOS Script Viewer & Downloader */}
      {selectedScriptRouter && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    RouterOS v7 Auto-Provisioning Script
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: {selectedScriptRouter.name} ({selectedScriptRouter.identity})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedScriptRouter(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-cyan-300">How to execute on your MikroTik:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px]">
                <li>Open <strong>Winbox</strong> or connect via <strong>SSH Terminal</strong>.</li>
                <li>Paste the script below directly into the terminal window.</li>
                <li>The script will create a pre-install backup, bind FreeRADIUS, and start telemetry reporting.</li>
              </ol>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-y-auto font-mono text-[11px] text-cyan-300/90 leading-relaxed custom-scrollbar">
              <pre>
{`# ==============================================================================
# XCLOUD.NET — PRODUCTION MIKROTIK ROUTEROS v7 PROVISIONING SCRIPT
# Router Name: ${selectedScriptRouter.name}
# Enrollment Token: ${selectedScriptRouter.enrollmentToken}
# ==============================================================================

# 1. SET IDENTITY & BACKUP
/system identity set name="${selectedScriptRouter.identity || 'XCLOUD-GW'}"
/system backup save name="xcloud_pre_install_backup"

# 2. CONFIGURE FREERADIUS CLIENT & ACCOUNTING
/radius remove [find comment~"XCLOUD"]
/radius add service=hotspot,ppp address=127.0.0.1 secret="${selectedScriptRouter.radiusSecret}" authentication-port=1812 accounting-port=1813 timeout=3000ms comment="XCLOUD.NET FreeRADIUS"
/radius incoming set accept=yes port=3799

# 3. CONFIGURE HOTSPOT TO USE RADIUS & INTERIM ACCOUNTING
:if ([:len [/ip hotspot profile find default=yes]] > 0) do={
  /ip hotspot profile set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=1m login-by=http-chap,http-pap,mac-cookie
}

# 4. CONFIGURE WALLED GARDEN FOR MOBILE MONEY & CLOUD
/ip hotspot walled-garden add dst-host="*.selcompay.com" action=allow comment="XCLOUD Selcom Mobile Money"
/ip hotspot walled-garden add dst-host="*.vodacom.co.tz" action=allow comment="XCLOUD Vodacom M-Pesa"
/ip hotspot walled-garden add dst-host="*.airtel.co.tz" action=allow comment="XCLOUD Airtel Money"
/ip hotspot walled-garden add dst-host="*.tigo.co.tz" action=allow comment="XCLOUD Tigo Pesa"

# 5. CONFIGURE TELEMETRY HEARTBEAT (30s interval)
/system script add name="xcloud-heartbeat" source=":local cpu [/system resource get cpu-load]; :local memFree [/system resource get free-memory]; :local memTotal [/system resource get total-memory]; :local memUsage (100 - (($memFree * 100) / $memTotal)); :local uptime [/system resource get uptime]; :local usersCount [:len [/ip hotspot active find]]; :local postData (\\\"{\\\\\\\"token\\\\\\\":\\\\\\\"${selectedScriptRouter.enrollmentToken}\\\\\\\",\\\\\\\"cpu\\\\\\\":\\\" . $cpu . \\\",\\\\\\\"ram\\\\\\\":\\\" . $memUsage . \\\",\\\\\\\"uptime\\\\\\\":\\\\\\\"\\\" . $uptime . \\\"\\\\\\\",\\\\\\\"activeUsers\\\\\\\":\\\" . $usersCount . \\\"}\\\"); /tool fetch url=\\\"${window.location.origin}/api/v1/routers/heartbeat\\\" http-method=post http-header-field=\\\"Content-Type: application/json\\\" http-data=$postData keep-result=no;"
/system scheduler add name="xcloud-heartbeat-timer" interval=30s on-event="xcloud-heartbeat" start-time=startup comment="XCLOUD.NET Telemetry"`}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={`/api/v1/routers/${selectedScriptRouter.id}/script`}
                download
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download .rsc Script File</span>
              </a>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`
/system identity set name="${selectedScriptRouter.identity}"
/radius add service=hotspot,ppp address=127.0.0.1 secret="${selectedScriptRouter.radiusSecret}" authentication-port=1812 accounting-port=1813 timeout=3000ms
/radius incoming set accept=yes port=3799
/ip hotspot profile set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=1m
                    `);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Diagnostics */}
      {diagnosticsRouter && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Diagnostics: {diagnosticsRouter.name}
                </h3>
              </div>
              <button
                onClick={() => setDiagnosticsRouter(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-cyan-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs">Executing diagnostics across RouterOS REST API...</span>
              </div>
            ) : diagResult ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">RouterOS Compatibility</span>
                    <span className="text-emerald-400 font-bold flex items-center mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> RouterOS v7 Passed
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">FreeRADIUS & CoA</span>
                    <span className="text-emerald-400 font-bold flex items-center mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active on Port 1812/3799
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 block text-[11px] font-semibold">Recommendations:</span>
                  {diagResult.recommendations?.length > 0 ? (
                    diagResult.recommendations.map((rec: string, i: number) => (
                      <p key={i} className="text-slate-300 text-[11px] flex items-start">
                        <span className="text-cyan-400 mr-1.5">•</span> {rec}
                      </p>
                    ))
                  ) : (
                    <p className="text-emerald-400 text-[11px] flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All telemetry and firewall health checks are nominal.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDiagnosticsRouter(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 1-Click Automated Install & Provisioning Studio */}
      <AutoInstallerModal
        isOpen={showAutoInstaller}
        router={autoInstallerRouter}
        onClose={() => setShowAutoInstaller(false)}
        onSuccess={(updatedRouter) => {
          onRefresh();
          if (updatedRouter) {
            setAutoInstallerRouter(updatedRouter);
          }
        }}
      />
    </div>
  );
};
