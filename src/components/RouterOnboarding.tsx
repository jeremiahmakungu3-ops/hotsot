// XCLOUD.NET — RouterOnboarding Component
// RouterOS v7 One-Click Automated Script Generator with modular toggles for:
// 1. Bridge Manager
// 2. VPN Setup (WireGuard / SSTP)
// 3. Hotspot Config (FreeRADIUS / Captive Portal / Walled Garden)
// 4. TTL Anti-Tethering (Mangle TTL=1 & Tether Lock)

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Lock,
  Flame,
  ShieldAlert,
  Terminal,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Globe,
  Wifi,
  ExternalLink,
  Plus,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Info
} from 'lucide-react';
import {
  Router,
  Tenant,
  AutoInstallConfig,
  AutoInstallPreset,
  TtlMode
} from '../types/index.ts';
import {
  fetchAutoInstallPresetConfig,
  generateAutoInstallScript,
  applyAutoInstallConfig,
  createRouter
} from '../lib/api.ts';

interface RouterOnboardingProps {
  routers?: Router[];
  selectedRouter?: Router | null;
  currentTenant?: Tenant | null;
  onOnboardingComplete?: (router: Router) => void;
  onBack?: () => void;
  isStandaloneView?: boolean;
}

export const RouterOnboarding: React.FC<RouterOnboardingProps> = ({
  routers = [],
  selectedRouter = null,
  currentTenant = null,
  onOnboardingComplete,
  onBack,
  isStandaloneView = true
}) => {
  // Target Router selection (existing or new)
  const [targetMode, setTargetMode] = useState<'NEW' | 'EXISTING'>(
    selectedRouter ? 'EXISTING' : 'NEW'
  );
  const [selectedTargetRouterId, setSelectedTargetRouterId] = useState<string>(
    selectedRouter?.id || ''
  );

  // Active Preset
  const [selectedPreset, setSelectedPreset] = useState<AutoInstallPreset>('ALL_IN_ONE_FULL_ISP');

  // Full Configuration State
  const [config, setConfig] = useState<AutoInstallConfig | null>(null);

  // Section Accordion Expand States
  const [expandedSection, setExpandedSection] = useState<
    'bridge' | 'vpn' | 'hotspot' | 'antiTether' | 'general' | 'none'
  >('none');

  // Output State
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [scriptFilename, setScriptFilename] = useState<string>('mikrotik_v7_autoinstall.rsc');
  const [scriptSize, setScriptSize] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'config' | 'script' | 'guide'>('config');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [customHost, setCustomHost] = useState<string>('');

  const allAvailablePorts = [
    'ether1 (WAN)',
    'ether2',
    'ether3',
    'ether4',
    'ether5',
    'wlan1 (2.4GHz)',
    'wlan2 (5GHz)',
    'sfp-sfpplus1'
  ];

  // Initialize preset
  useEffect(() => {
    loadPreset(selectedPreset, selectedTargetRouterId || undefined);
  }, [selectedPreset, selectedTargetRouterId]);

  const loadPreset = async (preset: AutoInstallPreset, routerId?: string) => {
    setIsLoading(true);
    try {
      const cfg = await fetchAutoInstallPresetConfig(preset, routerId);
      setConfig(cfg);
      // Auto-compile script preview
      const result = await generateAutoInstallScript(cfg);
      setGeneratedScript(result.script);
      setScriptFilename(result.filename);
      setScriptSize(result.sizeBytes);
    } catch (err) {
      console.error('Failed to load preset config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!config) return;
    setIsGenerating(true);
    try {
      const result = await generateAutoInstallScript(config);
      setGeneratedScript(result.script);
      setScriptFilename(result.filename);
      setScriptSize(result.sizeBytes);
      setActiveTab('script');
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyOrSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      let activeRouterId = config.routerId || selectedTargetRouterId;

      if (targetMode === 'NEW' || !activeRouterId) {
        // Create new router first
        const newRouter = await createRouter({
          tenantId: currentTenant?.id || 'tenant-1',
          name: config.routerName,
          identity: config.routerIdentity,
          model: config.hardwareModel || 'CCR2004-16G-2S+',
          ipAddress: config.hotspot?.gatewayIp || '10.100.1.1',
          location: 'Auto-Provisioned Site',
          status: 'PROVISIONING',
          isHotspotEnabled: config.hotspot?.enabled ?? true,
          isPppoeEnabled: false,
          isRadiusEnabled: config.hotspot?.enableRadius ?? true,
          radiusSecret: config.hotspot?.radiusSecret || 'XcloudRadiusSecret2025!',
          enrollmentToken: config.enrollmentToken || `tok-${Date.now()}`
        });

        activeRouterId = newRouter.id;
        setSelectedTargetRouterId(newRouter.id);
        setTargetMode('EXISTING');
      }

      // Apply script & config
      const res = await applyAutoInstallConfig(activeRouterId, {
        ...config,
        routerId: activeRouterId
      });

      setGeneratedScript(res.script);
      setScriptFilename(res.filename);
      setSaveSuccessMessage(
        `Router "${res.router.name}" successfully onboarded and configured!`
      );
      setActiveTab('script');

      if (onOnboardingComplete) {
        onOnboardingComplete(res.router);
      }
    } catch (err) {
      console.error('Failed to save router:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: 'script' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  const downloadScriptFile = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = scriptFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleBridgePort = (portStr: string) => {
    if (!config) return;
    const cleanPort = portStr.split(' ')[0];
    const ports = config.bridge.ports.includes(cleanPort)
      ? config.bridge.ports.filter((p) => p !== cleanPort)
      : [...config.bridge.ports, cleanPort];

    setConfig({
      ...config,
      bridge: { ...config.bridge, ports }
    });
  };

  const addCustomWalledHost = () => {
    if (!customHost.trim() || !config) return;
    const hosts = [...config.captivePortal.customWalledGardenHosts, customHost.trim()];
    setConfig({
      ...config,
      captivePortal: { ...config.captivePortal, customWalledGardenHosts: hosts }
    });
    setCustomHost('');
  };

  const removeCustomWalledHost = (idx: number) => {
    if (!config) return;
    const hosts = config.captivePortal.customWalledGardenHosts.filter((_, i) => i !== idx);
    setConfig({
      ...config,
      captivePortal: { ...config.captivePortal, customWalledGardenHosts: hosts }
    });
  };

  const fetchCommand = config
    ? `/tool fetch url="${window.location.origin}/api/v1/routers/script/${config.routerIdentity || 'mikrotik'}.rsc" mode=https dst-path=xcloud_install.rsc; /import xcloud_install.rsc`
    : '';

  return (
    <div id="router-onboarding-studio" className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gradient-to-br from-cyan-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  RouterOS v7 Onboarding Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-semibold">
                  1-Click Automation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                  RouterOS 7.12+
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate production-ready RouterOS shell provisioning scripts with modular toggles for
                Bridge, WireGuard VPN, Hotspot, and TTL Anti-Tethering.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Fleet
              </button>
            )}
            <button
              id="btn-onboarding-oneclick-generate"
              type="button"
              onClick={handleGenerateScript}
              disabled={isGenerating || isLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>1-Click Generate Script</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Select Deployment Profile Preset:
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPreset('ALL_IN_ONE_FULL_ISP');
                loadPreset('ALL_IN_ONE_FULL_ISP', selectedTargetRouterId);
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'ALL_IN_ONE_FULL_ISP'
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>All-In-One Full ISP</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Bridge + Remote Cloud + WireGuard + Hotspot + Anti-Tether (TTL=1)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPreset('SECURE_HOTSPOT_ANTI_TETHER');
                loadPreset('SECURE_HOTSPOT_ANTI_TETHER', selectedTargetRouterId);
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'SECURE_HOTSPOT_ANTI_TETHER'
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Anti-Tether Hotspot</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Strict TTL=1 packet drop, proxy port blocks & mobile money walled garden
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPreset('CLOUD_REMOTE_WIREGUARD');
                loadPreset('CLOUD_REMOTE_WIREGUARD', selectedTargetRouterId);
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'CLOUD_REMOTE_WIREGUARD'
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cloud WireGuard</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Remote Winbox, Cloud DDNS & high-speed VPN tunnel routing
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPreset('SIMPLE_HOTSPOT_QUICK');
                loadPreset('SIMPLE_HOTSPOT_QUICK', selectedTargetRouterId);
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === 'SIMPLE_HOTSPOT_QUICK'
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Hotspot</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Standard Bridge, DHCP Pool & FreeRADIUS 3.0 AAA binding
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Target Router Selector & General Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Router Target & Hardware Profile</h3>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTargetMode('NEW')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                targetMode === 'NEW'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              New Router
            </button>
            <button
              type="button"
              onClick={() => setTargetMode('EXISTING')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                targetMode === 'EXISTING'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Existing Router ({routers.length})
            </button>
          </div>
        </div>

        {targetMode === 'EXISTING' && routers.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Fleet Router to Provision:
            </label>
            <select
              value={selectedTargetRouterId}
              onChange={(e) => {
                setSelectedTargetRouterId(e.target.value);
                loadPreset(selectedPreset, e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.identity} ({r.model || 'MikroTik'} / {r.ipAddress})
                </option>
              ))}
            </select>
          </div>
        )}

        {config && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                System Identity
              </label>
              <input
                type="text"
                value={config.routerIdentity}
                onChange={(e) => setConfig({ ...config, routerIdentity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hardware Model
              </label>
              <select
                value={config.hardwareModel}
                onChange={(e) => setConfig({ ...config, hardwareModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="CCR2004-16G-2S+">CCR2004-16G-2S+ (Core Router)</option>
                <option value="RB4011iGS+5HacQ2HnD-IN">RB4011 (Distribution)</option>
                <option value="hAP ax3">hAP ax3 (WiFi 6 HotSpot)</option>
                <option value="hAP ax2">hAP ax2 (Compact Gateway)</option>
                <option value="Cloud Hosted Router (CHR)">CHR (Cloud x86 VM)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                NTP Server
              </label>
              <input
                type="text"
                value={config.ntpServer}
                onChange={(e) => setConfig({ ...config, ntpServer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* THE 4 CORE MODULAR TOGGLE CARDS */}
      {config && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Modular Feature Toggles & Script Configuration
            </h3>
            <span className="text-[11px] text-slate-500">
              Toggle features on/off to include in the generated RouterOS v7 script
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. BRIDGE MANAGER TOGGLE */}
            <div
              id="feature-toggle-bridge-manager"
              className={`border rounded-2xl p-4 transition-all ${
                config.bridge.enabled
                  ? 'bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      config.bridge.enabled
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">Bridge Manager</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          config.bridge.enabled
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {config.bridge.enabled ? 'ACTIVE' : 'SKIPPED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unified LAN bridge, STP loop prevention, & Fast Forward.
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="toggle-bridge-manager"
                    type="checkbox"
                    checked={config.bridge.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        bridge: { ...config.bridge, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {/* Sub-settings */}
              {config.bridge.enabled && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Bridge Name:</span>
                      <input
                        type="text"
                        value={config.bridge.bridgeName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bridge: { ...config.bridge, bridgeName: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">STP Protocol:</span>
                      <select
                        value={config.bridge.stpProtocol}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bridge: {
                              ...config.bridge,
                              stpProtocol: e.target.value as any
                            }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="rstp">RSTP (Rapid Spanning Tree)</option>
                        <option value="stp">Classic STP</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1.5">
                      Bridge Member Interfaces:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allAvailablePorts.map((port) => {
                        const cleanPort = port.split(' ')[0];
                        const isSelected = config.bridge.ports.includes(cleanPort);
                        return (
                          <button
                            key={port}
                            type="button"
                            onClick={() => toggleBridgePort(port)}
                            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {cleanPort}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. VPN SETUP TOGGLE */}
            <div
              id="feature-toggle-vpn-setup"
              className={`border rounded-2xl p-4 transition-all ${
                config.vpn.enabled
                  ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      config.vpn.enabled
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">VPN Setup (WireGuard)</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          config.vpn.enabled
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {config.vpn.enabled ? 'ACTIVE' : 'SKIPPED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Encrypted Cloud WireGuard backhaul & SSTP CGNAT bypass.
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="toggle-vpn-setup"
                    type="checkbox"
                    checked={config.vpn.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        vpn: { ...config.vpn, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Sub-settings */}
              {config.vpn.enabled && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tunnel IP Address:</span>
                      <input
                        type="text"
                        value={config.vpn.wireguardAddress}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vpn: { ...config.vpn, wireguardAddress: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Listen Port:</span>
                      <input
                        type="number"
                        value={config.vpn.wireguardPort}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vpn: {
                              ...config.vpn,
                              wireguardPort: parseInt(e.target.value) || 13231
                            }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Peer Endpoint Hub:</span>
                      <input
                        type="text"
                        placeholder="vpn.xcloud.net:13231"
                        value={config.vpn.wireguardPeerEndpoint || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vpn: { ...config.vpn, wireguardPeerEndpoint: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Allowed IPs:</span>
                      <input
                        type="text"
                        value={config.vpn.wireguardAllowedIps || '10.254.0.0/16'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vpn: { ...config.vpn, wireguardAllowedIps: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. HOTSPOT CONFIG TOGGLE */}
            <div
              id="feature-toggle-hotspot-config"
              className={`border rounded-2xl p-4 transition-all ${
                config.hotspot.enabled
                  ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      config.hotspot.enabled
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">Hotspot Config</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          config.hotspot.enabled
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {config.hotspot.enabled ? 'ACTIVE' : 'SKIPPED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      HotSpot server, FreeRADIUS AAA, & mobile money walled garden.
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="toggle-hotspot-config"
                    type="checkbox"
                    checked={config.hotspot.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hotspot: { ...config.hotspot, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Sub-settings */}
              {config.hotspot.enabled && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Gateway IP:</span>
                      <input
                        type="text"
                        value={config.hotspot.gatewayIp}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            hotspot: { ...config.hotspot, gatewayIp: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">DNS Hostname:</span>
                      <input
                        type="text"
                        value={config.hotspot.dnsName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            hotspot: { ...config.hotspot, dnsName: e.target.value }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.hotspot.enableRadius}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            hotspot: { ...config.hotspot, enableRadius: e.target.checked }
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Enable FreeRADIUS 3.0 (CoA 3799)</span>
                    </label>

                    <span className="text-[10px] text-amber-400 font-mono">
                      Secret: {config.hotspot.radiusSecret.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. TTL ANTI-TETHERING TOGGLE */}
            <div
              id="feature-toggle-anti-tethering"
              className={`border rounded-2xl p-4 transition-all ${
                config.antiTethering.enabled
                  ? 'bg-slate-900 border-rose-500/40 shadow-lg shadow-rose-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      config.antiTethering.enabled
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">TTL Anti-Tethering</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          config.antiTethering.enabled
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {config.antiTethering.enabled ? 'ENFORCED (TTL=1)' : 'SKIPPED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stops hotspot sharing via phone tethering, routers & WiFi extenders.
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="toggle-anti-tethering"
                    type="checkbox"
                    checked={config.antiTethering.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        antiTethering: {
                          ...config.antiTethering,
                          enabled: e.target.checked
                        }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Sub-settings */}
              {config.antiTethering.enabled && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Mangle TTL Mode:</span>
                      <select
                        value={config.antiTethering.ttlMode}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            antiTethering: {
                              ...config.antiTethering,
                              ttlMode: e.target.value as TtlMode
                            }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="STRICT_TTL_1">Strict Postrouting (TTL=1 Drop)</option>
                        <option value="BOTH_INGRESS_EGRESS">Dual Ingress + Egress Lock</option>
                        <option value="STANDARD_TTL_64">Standard TTL Normalization</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Change TTL Value:</span>
                      <input
                        type="number"
                        min="1"
                        max="64"
                        value={config.antiTethering.changeTtlValue}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            antiTethering: {
                              ...config.antiTethering,
                              changeTtlValue: parseInt(e.target.value) || 1
                            }
                          })
                        }
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs pt-1 text-slate-300">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.antiTethering.blockHttpTetheringProxies}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            antiTethering: {
                              ...config.antiTethering,
                              blockHttpTetheringProxies: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                      />
                      <span>Block Proxy Apps (8080, 8888)</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.antiTethering.blockSharingSubnets}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            antiTethering: {
                              ...config.antiTethering,
                              blockSharingSubnets: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                      />
                      <span>Drop Tether Subnets</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCRIPT OUTPUT & EXECUTION SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Navigation bar between Script / Guide */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Generated RouterOS v7 Installation Script</h3>
            {scriptSize > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {(scriptSize / 1024).toFixed(1)} KB • {generatedScript.split('\n').length} lines
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => copyToClipboard(generatedScript, 'script')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedScript ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={downloadScriptFile}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .rsc</span>
            </button>

            <button
              type="button"
              onClick={handleApplyOrSave}
              disabled={isSaving}
              className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Save & Onboard Router</span>
            </button>
          </div>
        </div>

        {/* Save success toast */}
        {saveSuccessMessage && (
          <div className="px-5 py-2.5 bg-emerald-950/60 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* One-Line Winbox Fetch Command */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            1-Line RouterOS CLI Terminal Command:
          </span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-nowrap">
              {fetchCommand}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(fetchCommand, 'cmd')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 cursor-pointer border border-slate-700"
            >
              {copiedCmd ? 'Copied Command!' : 'Copy Command'}
            </button>
          </div>
        </div>

        {/* Code Terminal View */}
        <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[380px] custom-scrollbar">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
            <code>{generatedScript || '# Click "1-Click Generate Script" above to compile RouterOS v7 script'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
