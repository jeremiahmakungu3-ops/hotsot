// XCLOUD.NET — One-Click Automated Installer & Script Provisioning Studio
// Comprehensive provisioning: Bridge Manager, Remote Access, WireGuard VPN, Hotspot, Captive Portal, and TTL Anti-Tethering

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Globe,
  Shield,
  Flame,
  Radio,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Server,
  Zap,
  Lock,
  ChevronRight,
  Wifi,
  ExternalLink,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  Router,
  AutoInstallConfig,
  AutoInstallPreset,
  TtlMode
} from '../types/index.ts';
import {
  fetchAutoInstallPresetConfig,
  generateAutoInstallScript,
  applyAutoInstallConfig
} from '../lib/api.ts';

interface AutoInstallerModalProps {
  router?: Router | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedRouter?: Router) => void;
}

type TabType =
  | 'overview'
  | 'bridge'
  | 'remote'
  | 'vpn'
  | 'hotspot'
  | 'portal'
  | 'anti_tether'
  | 'script_output';

export const AutoInstallerModal: React.FC<AutoInstallerModalProps> = ({
  router,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPreset, setSelectedPreset] = useState<AutoInstallPreset>('ALL_IN_ONE_FULL_ISP');
  const [config, setConfig] = useState<AutoInstallConfig | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [scriptFilename, setScriptFilename] = useState<string>('xcloud_autoinstall.rsc');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [customHostInput, setCustomHostInput] = useState<string>('');
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Available Bridge Ports
  const allAvailablePorts = [
    'ether1 (WAN)',
    'ether2',
    'ether3',
    'ether4',
    'ether5',
    'wlan1 (2.4GHz)',
    'wlan2 (5GHz)',
    'sfp-sfpplus1',
  ];

  // Load preset configuration
  useEffect(() => {
    if (isOpen) {
      loadPreset(selectedPreset);
    }
  }, [isOpen, router]);

  const loadPreset = async (preset: AutoInstallPreset) => {
    setIsLoading(true);
    try {
      const cfg = await fetchAutoInstallPresetConfig(preset, router?.id);
      setConfig(cfg);
      // Auto compile initial script
      const result = await generateAutoInstallScript(cfg);
      setGeneratedScript(result.script);
      setScriptFilename(result.filename);
    } catch (err) {
      console.error('Failed to load preset config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (preset: AutoInstallPreset) => {
    setSelectedPreset(preset);
    loadPreset(preset);
  };

  const handleCompileScript = async () => {
    if (!config) return;
    setIsGenerating(true);
    try {
      const result = await generateAutoInstallScript(config);
      setGeneratedScript(result.script);
      setScriptFilename(result.filename);
      setActiveTab('script_output');
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToRouter = async () => {
    if (!config || !router) {
      handleCompileScript();
      return;
    }
    setIsGenerating(true);
    setApplySuccessMsg(null);
    try {
      const res = await applyAutoInstallConfig(router.id, config);
      setGeneratedScript(res.script);
      setScriptFilename(res.filename);
      setApplySuccessMsg('Configuration successfully applied and compiled!');
      setActiveTab('script_output');
      if (onSuccess) onSuccess(res.router);
    } catch (err) {
      console.error('Failed to apply config:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBridgePort = (port: string) => {
    if (!config) return;
    const cleanPort = port.split(' ')[0];
    const ports = config.bridge.ports.includes(cleanPort)
      ? config.bridge.ports.filter((p) => p !== cleanPort)
      : [...config.bridge.ports, cleanPort];
    setConfig({
      ...config,
      bridge: { ...config.bridge, ports },
    });
  };

  const addCustomWalledHost = () => {
    if (!customHostInput.trim() || !config) return;
    const hosts = [...config.captivePortal.customWalledGardenHosts, customHostInput.trim()];
    setConfig({
      ...config,
      captivePortal: {
        ...config.captivePortal,
        customWalledGardenHosts: hosts,
      },
    });
    setCustomHostInput('');
  };

  const removeCustomWalledHost = (index: number) => {
    if (!config) return;
    const hosts = config.captivePortal.customWalledGardenHosts.filter((_, i) => i !== index);
    setConfig({
      ...config,
      captivePortal: {
        ...config.captivePortal,
        customWalledGardenHosts: hosts,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">1-Click Automated Install Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-semibold">
                  RouterOS v7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bridge Manager • Remote Cloud • VPN • Hotspot • Captive Portal • Anti-Tethering (TTL=1)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Preset Selector Banner */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Quick Setup Presets:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Target: {router ? `${router.name} (${router.identity})` : 'New Router Template'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('ALL_IN_ONE_FULL_ISP')}
              className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'ALL_IN_ONE_FULL_ISP'
                  ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>All-In-One ISP</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Bridge + Remote + VPN + Hotspot + Anti-Tether
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('SECURE_HOTSPOT_ANTI_TETHER')}
              className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'SECURE_HOTSPOT_ANTI_TETHER'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Tether Hotspot</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Hotspot + TTL=1 Lock + Mobile Money
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('CLOUD_REMOTE_WIREGUARD')}
              className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'CLOUD_REMOTE_WIREGUARD'
                  ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cloud WireGuard</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                WireGuard VPN + Cloud DDNS + Remote Winbox
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('SIMPLE_HOTSPOT_QUICK')}
              className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'SIMPLE_HOTSPOT_QUICK'
                  ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Hotspot</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Standard Bridge + DHCP + FreeRADIUS
              </p>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900 flex space-x-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Overview & Baseline</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bridge'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bridge Manager</span>
            {config?.bridge.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('remote')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'remote'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Bridge Remote & Cloud</span>
            {config?.remote.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vpn')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'vpn'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>VPN Manager (WireGuard)</span>
            {config?.vpn.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('hotspot')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hotspot'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Hotspot Core</span>
            {config?.hotspot.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'portal'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Captive Portal & Walled</span>
          </button>

          <button
            onClick={() => setActiveTab('anti_tether')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'anti_tether'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>TTL Anti-Tethered</span>
            {config?.antiTethering.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('script_output')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'script_output'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Compiled .rsc Script</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-xs">Preparing automated installer matrix...</p>
            </div>
          ) : config ? (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-sm text-white flex items-center">
                      <Server className="w-4 h-4 mr-2 text-cyan-400" />
                      Router Baseline & Identification
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Router Display Name
                        </label>
                        <input
                          type="text"
                          value={config.routerName}
                          onChange={(e) => setConfig({ ...config, routerName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Router Identity (Winbox / System)
                        </label>
                        <input
                          type="text"
                          value={config.routerIdentity}
                          onChange={(e) => setConfig({ ...config, routerIdentity: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Hardware Platform
                        </label>
                        <select
                          value={config.hardwareModel}
                          onChange={(e) => setConfig({ ...config, hardwareModel: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="CCR2004-16G-2S+">CCR2004-16G-2S+ (Core Carrier Router)</option>
                          <option value="RB4011iGS+5HacQ2HnD-IN">RB4011 (Distribution Gateway)</option>
                          <option value="hAP ax3">hAP ax3 (Branch WiFi 6)</option>
                          <option value="hAP ax2">hAP ax2 (Compact WiFi 6)</option>
                          <option value="Cloud Hosted Router (CHR)">CHR (Cloud x86 VM / KVM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          NTP Synchronization Server
                        </label>
                        <input
                          type="text"
                          value={config.ntpServer}
                          onChange={(e) => setConfig({ ...config, ntpServer: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Primary & Secondary DNS Resolvers
                      </label>
                      <input
                        type="text"
                        value={config.dnsServers.join(', ')}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            dnsServers: e.target.value.split(',').map((s) => s.trim()),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Feature Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Bridge Manager</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {config.bridge.enabled
                          ? `${config.bridge.bridgeName} (${config.bridge.ports.length} ports)`
                          : 'Disabled'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Remote & Cloud</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {config.remote.enableCloudDdns ? 'MikroTik Cloud DDNS On' : 'Standard'} • Port {config.remote.winboxWanPort}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>WireGuard VPN</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {config.vpn.enabled ? `${config.vpn.wireguardAddress}` : 'Inactive'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>HotSpot Gateway</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {config.hotspot.gatewayIp} • FreeRADIUS
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Mobile Money Walled</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Selcom, M-Pesa, Airtel, Tigo, Halo
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-400">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>TTL Anti-Tether</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {config.antiTethering.enabled ? `Locked TTL=${config.antiTethering.changeTtlValue}` : 'Off'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRIDGE MANAGER */}
              {activeTab === 'bridge' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-sm text-white">Bridge Configuration</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.bridge.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              bridge: { ...config.bridge, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Bridge Interface Name
                        </label>
                        <input
                          type="text"
                          value={config.bridge.bridgeName}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              bridge: { ...config.bridge, bridgeName: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Spanning Tree Protocol (STP)
                        </label>
                        <select
                          value={config.bridge.stpProtocol}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              bridge: {
                                ...config.bridge,
                                stpProtocol: e.target.value as any,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="rstp">Rapid Spanning Tree (RSTP - Recommended)</option>
                          <option value="stp">Classic STP</option>
                          <option value="none">None (Disabled)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">
                        Bridge Member Ports
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {allAvailablePorts.map((port) => {
                          const cleanPort = port.split(' ')[0];
                          const isSelected = config.bridge.ports.includes(cleanPort);
                          return (
                            <button
                              key={port}
                              type="button"
                              onClick={() => toggleBridgePort(port)}
                              className={`p-2.5 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{port}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.bridge.fastForward}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              bridge: { ...config.bridge, fastForward: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Enable Hardware Fast Forward</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.bridge.dhcpSnooping}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              bridge: { ...config.bridge, dhcpSnooping: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Enable DHCP Snooping / Rogue Guard</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BRIDGE REMOTE & CLOUD */}
              {activeTab === 'remote' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-sm text-white">Remote Management & IP Cloud</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.remote.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              remote: { ...config.remote, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <label className="flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer">
                          <span>MikroTik Cloud Dynamic DNS (DDNS)</span>
                          <input
                            type="checkbox"
                            checked={config.remote.enableCloudDdns}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                remote: { ...config.remote, enableCloudDdns: e.target.checked },
                              })
                            }
                            className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Automatically registers a free MikroTik sub-domain (`*.sn.mynetname.net`) for static access behind dynamic IPs.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <label className="flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer">
                          <span>RouterOS v7 Back-To-Home</span>
                          <input
                            type="checkbox"
                            checked={config.remote.enableBackToHome}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                remote: { ...config.remote, enableBackToHome: e.target.checked },
                              })
                            }
                            className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Enables native Cloud WireGuard relay for one-click mobile app / Winbox connection.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Winbox WAN Port
                        </label>
                        <input
                          type="number"
                          value={config.remote.winboxWanPort}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              remote: {
                                ...config.remote,
                                winboxWanPort: parseInt(e.target.value) || 8291,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          REST API (HTTPS) Port
                        </label>
                        <input
                          type="number"
                          value={config.remote.restApiPort}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              remote: {
                                ...config.remote,
                                restApiPort: parseInt(e.target.value) || 8729,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          SSH WAN Port
                        </label>
                        <input
                          type="number"
                          value={config.remote.sshPort}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              remote: {
                                ...config.remote,
                                sshPort: parseInt(e.target.value) || 22,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VPN MANAGER */}
              {activeTab === 'vpn' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-sm text-white">WireGuard VPN & Cloud Backhaul</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.vpn.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: { ...config.vpn, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          WireGuard Tunnel IP / Subnet
                        </label>
                        <input
                          type="text"
                          value={config.vpn.wireguardAddress}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: { ...config.vpn, wireguardAddress: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          WireGuard Listen Port
                        </label>
                        <input
                          type="number"
                          value={config.vpn.wireguardPort}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: {
                                ...config.vpn,
                                wireguardPort: parseInt(e.target.value) || 13231,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Central Hub Peer Endpoint
                        </label>
                        <input
                          type="text"
                          placeholder="vpn.xcloud.net:13231"
                          value={config.vpn.wireguardPeerEndpoint || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: { ...config.vpn, wireguardPeerEndpoint: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Allowed IPs Routing
                        </label>
                        <input
                          type="text"
                          value={config.vpn.wireguardAllowedIps || '10.254.0.0/16, 10.100.0.0/16'}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: { ...config.vpn, wireguardAllowedIps: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <label className="flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer">
                        <div className="space-y-0.5">
                          <span>SSTP Remote Management Server</span>
                          <p className="text-[11px] text-slate-400">
                            Enables SSL/TLS VPN on port {config.vpn.sstpPort} to bypass strict ISP NAT / CGNAT.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.vpn.enableSstpServer}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vpn: { ...config.vpn, enableSstpServer: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HOTSPOT SETUP */}
              {activeTab === 'hotspot' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <h4 className="font-bold text-sm text-white">Hotspot Server & IP Pool</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.hotspot.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hotspot: { ...config.hotspot, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          HotSpot Interface
                        </label>
                        <input
                          type="text"
                          value={config.hotspot.interface}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hotspot: { ...config.hotspot, interface: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          HotSpot Gateway IP
                        </label>
                        <input
                          type="text"
                          value={config.hotspot.gatewayIp}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hotspot: { ...config.hotspot, gatewayIp: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          DHCP Pool Range (Start - End)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={config.hotspot.dhcpPoolStart}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                hotspot: {
                                  ...config.hotspot,
                                  dhcpPoolStart: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={config.hotspot.dhcpPoolEnd}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                hotspot: { ...config.hotspot, dhcpPoolEnd: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          DNS Host Name (Login URL)
                        </label>
                        <input
                          type="text"
                          value={config.hotspot.dnsName}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hotspot: { ...config.hotspot, dnsName: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* FreeRADIUS Binding */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          FreeRADIUS 3.0 & RFC 3576 CoA Disconnect
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          Ports: Auth 1812 • Acct 1813 • CoA 3799
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          RADIUS Shared Secret (NAS Secret)
                        </label>
                        <input
                          type="text"
                          value={config.hotspot.radiusSecret}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hotspot: { ...config.hotspot, radiusSecret: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CAPTIVE PORTAL & WALLED GARDEN */}
              {activeTab === 'portal' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                      <Radio className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-sm text-white">
                        Tanzania & East Africa Mobile Money Walled Garden
                      </h4>
                    </div>

                    <p className="text-xs text-slate-400">
                      Allow customers to complete Selcom, M-Pesa, Airtel Money, Tigo Pesa, and HaloPesa payments seamlessly without buying data first.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-slate-200 font-medium">Selcom Pay</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.selcom}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  selcom: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>

                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-rose-400 font-medium">Vodacom M-Pesa</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.vodacomMpesa}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  vodacomMpesa: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>

                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-amber-400 font-medium">Airtel Money</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.airtelMoney}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  airtelMoney: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>

                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-blue-400 font-medium">Tigo Pesa</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.tigoPesa}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  tigoPesa: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>

                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-orange-400 font-medium">Halotel HaloPesa</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.haloPesa}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  haloPesa: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>

                      <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
                        <span className="text-xs text-emerald-400 font-medium">CRDB / NMB Banks</span>
                        <input
                          type="checkbox"
                          checked={config.captivePortal.walledGardenPresets.tanzaniaBanks}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              captivePortal: {
                                ...config.captivePortal,
                                walledGardenPresets: {
                                  ...config.captivePortal.walledGardenPresets,
                                  tanzaniaBanks: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>
                    </div>

                    {/* Custom Walled Garden Tag Input */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Custom Walled Garden Domains
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. portal.myhotel.co.tz"
                          value={customHostInput}
                          onChange={(e) => setCustomHostInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomWalledHost()}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={addCustomWalledHost}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Add Host
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {config.captivePortal.customWalledGardenHosts.map((host, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center space-x-1.5 font-mono"
                          >
                            <span>{host}</span>
                            <button
                              type="button"
                              onClick={() => removeCustomWalledHost(idx)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: TTL ANTI-TETHERED */}
              {activeTab === 'anti_tether' && (
                <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <div>
                          <h4 className="font-bold text-sm text-white">TTL Anti-Tethering Engine</h4>
                          <p className="text-[11px] text-slate-400">
                            Block WiFi range extenders, Android tethering, and hotspot sharing hacks.
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.antiTethering.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              antiTethering: {
                                ...config.antiTethering,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-300 space-y-1">
                      <p className="font-semibold flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1.5" />
                        How Anti-Tethering Protection Works:
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        When users buy 1 voucher code and turn on their mobile hotspot or connect a TP-Link range extender, the router sets packet Time-To-Live (TTL) to <strong>1</strong>. Any forwarded packet to secondary devices decrements TTL to <strong>0</strong> and gets dropped by the next hop, protecting your bandwidth and voucher sales!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Anti-Tethering Protection Mode
                        </label>
                        <select
                          value={config.antiTethering.ttlMode}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              antiTethering: {
                                ...config.antiTethering,
                                ttlMode: e.target.value as TtlMode,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="BOTH_INGRESS_EGRESS">
                            Dual Ingress & Egress (Recommended - Full Extender Lock)
                          </option>
                          <option value="STRICT_TTL_1">
                            Strict TTL = 1 Lock (Total Block of Secondary Routers)
                          </option>
                          <option value="STANDARD_TTL_64">
                            Standard Normalization (TTL = 64)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Egress TTL Value
                        </label>
                        <input
                          type="number"
                          value={config.antiTethering.changeTtlValue}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              antiTethering: {
                                ...config.antiTethering,
                                changeTtlValue: parseInt(e.target.value) || 1,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.antiTethering.blockHttpTetheringProxies}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              antiTethering: {
                                ...config.antiTethering,
                                blockHttpTetheringProxies: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                        />
                        <span>Block HTTP / SOCKS Tethering Apps (EveryProxy, NetShare, PdaNet on 8080/8888/1080)</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.antiTethering.enforceOneSessionPerMac}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              antiTethering: {
                                ...config.antiTethering,
                                enforceOneSessionPerMac: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                        />
                        <span>Enforce Single Simultaneous Session per MAC / Voucher Code</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SCRIPT OUTPUT */}
              {activeTab === 'script_output' && (
                <div className="space-y-4 max-w-4xl animate-in fade-in duration-150 h-full flex flex-col">
                  {applySuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{applySuccessMsg}</span>
                    </div>
                  )}

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{scriptFilename}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ready for RouterOS v7.10+ • Full Feature Provisioning
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(generatedScript)}`}
                        download={scriptFilename}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Download .rsc</span>
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedScript);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal 1-Liner Quick Execution */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                      <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                      Winbox / Terminal Execution Command:
                    </span>
                    <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      <code className="text-xs font-mono text-cyan-300 select-all">
                        /tool fetch url="{window.location.origin}/api/v1/routers/{router?.id || 'rtr-main'}/script" dst-path="xcloud.rsc"; /import xcloud.rsc;
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `/tool fetch url="${window.location.origin}/api/v1/routers/${router?.id || 'rtr-main'}/script" dst-path="xcloud.rsc"; /import xcloud.rsc;`
                          );
                          setCopiedCmd(true);
                          setTimeout(() => setCopiedCmd(false), 2000);
                        }}
                        className="text-xs text-slate-400 hover:text-white ml-2 cursor-pointer font-mono"
                      >
                        {copiedCmd ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Script Text Box */}
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-cyan-300/90 leading-relaxed custom-scrollbar max-h-[380px]">
                    <pre>{generatedScript}</pre>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Idempotent script • Pre-install safety backup included</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isGenerating || isLoading}
              onClick={handleCompileScript}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Compile Script</span>
            </button>

            <button
              type="button"
              disabled={isGenerating || isLoading}
              onClick={handleApplyToRouter}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{router ? 'Apply & Generate .rsc' : 'Generate 1-Click Script'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
