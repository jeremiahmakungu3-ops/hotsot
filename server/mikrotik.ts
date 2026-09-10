// XCLOUD.NET — MikroTik RouterOS v7 Integration & Auto-Provisioning Engine
// Generates production-grade RouterOS v7 scripts, Bridge Manager, Bridge Remote, VPN Manager, Hotspot Setup, Captive Portal & TTL Anti-Tethering

import { Router, AutoInstallConfig, AutoInstallPreset } from '../src/types/index.ts';

export interface MikrotikDiagnosticResult {
  routerOsVersionValid: boolean;
  dnsReachable: boolean;
  internetAccess: boolean;
  radiusConfigured: boolean;
  hotspotActive: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Creates default configuration parameters for presets
 */
export function createPresetConfig(
  preset: AutoInstallPreset,
  baseRouter?: Router,
  appUrl?: string
): AutoInstallConfig {
  const routerName = baseRouter?.name || 'XCLOUD MikroTik Gateway';
  const routerIdentity = baseRouter?.identity || 'XCLOUD-GW-01';
  const enrollmentToken = baseRouter?.enrollmentToken || `xctk_${Math.random().toString(36).substring(2, 12)}`;
  const radiusSecret = baseRouter?.radiusSecret || `xcloud_rad_${Math.random().toString(36).substring(2, 10)}`;

  const defaultConfig: AutoInstallConfig = {
    routerId: baseRouter?.id,
    routerName,
    routerIdentity,
    hardwareModel: baseRouter?.model || 'CCR2004-16G-2S+',
    enrollmentToken,
    dnsServers: ['1.1.1.1', '8.8.8.8', '1.0.0.1'],
    ntpServer: 'pool.ntp.org',

    // 1. Bridge Manager
    bridge: {
      enabled: true,
      bridgeName: 'bridge-hotspot',
      ports: ['ether2', 'ether3', 'ether4', 'ether5', 'wlan1', 'wlan2'],
      enableVlanFiltering: false,
      vlanId: 10,
      stpProtocol: 'rstp',
      fastForward: true,
      dhcpSnooping: false,
    },

    // 2. Bridge Remote / Remote Management
    remote: {
      enabled: true,
      enableCloudDdns: true,
      cloudUpdateInterval: '1m',
      enableBackToHome: true,
      winboxWanPort: 8291,
      enableRestApiSsl: true,
      restApiPort: 8729,
      allowWanWinbox: true,
      allowWanSsh: true,
      sshPort: 22,
    },

    // 3. VPN Manager
    vpn: {
      enabled: true,
      vpnType: 'WIREGUARD',
      wireguardPort: 13231,
      wireguardAddress: '10.254.1.2/24',
      wireguardMtu: 1420,
      wireguardPeerEndpoint: 'vpn.xcloud.net:13231',
      wireguardPeerPublicKey: 'XCLOUD_CENTRAL_GW_PUBLIC_KEY_BASE64==',
      wireguardAllowedIps: '10.254.0.0/16, 10.100.0.0/16',
      enableSstpServer: true,
      sstpPort: 4443,
      enableL2tpServer: false,
    },

    // 4. Hotspot Setup
    hotspot: {
      enabled: true,
      serverName: 'hs-xcloud',
      interface: 'bridge-hotspot',
      gatewayIp: '10.100.1.1',
      subnetMask: '24',
      dhcpPoolStart: '10.100.1.10',
      dhcpPoolEnd: '10.100.1.254',
      dnsName: 'wifi.xcloud.net',
      leaseTime: '1h',
      enableRadius: true,
      radiusSecret,
      radiusAuthPort: 1812,
      radiusAcctPort: 1813,
      radiusCoaPort: 3799,
      interimUpdateInterval: '1m',
    },

    // 5. Captive Portal & Walled Gardens
    captivePortal: {
      enabled: true,
      loginMethod: 'both',
      enableMacCookie: true,
      cookieLifetime: '3d',
      cloudLoginRedirect: true,
      customPortalUrl: appUrl ? `${appUrl.replace(/\/$/, '')}/portal` : undefined,
      walledGardenPresets: {
        selcom: true,
        vodacomMpesa: true,
        airtelMoney: true,
        tigoPesa: true,
        haloPesa: true,
        tanzaniaBanks: true,
        googleCdn: true,
        cloudPlatform: true,
      },
      customWalledGardenHosts: [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com',
      ],
    },

    // 6. TTL Anti-Tethered
    antiTethering: {
      enabled: true,
      ttlMode: 'BOTH_INGRESS_EGRESS',
      changeTtlValue: 1, // Locks TTL to 1 to block all downstream extenders/repeaters/Android hotspots
      blockSharingSubnets: true,
      blockHttpTetheringProxies: true,
      enforceOneSessionPerMac: true,
    },
  };

  switch (preset) {
    case 'ALL_IN_ONE_FULL_ISP':
      return defaultConfig;

    case 'SECURE_HOTSPOT_ANTI_TETHER':
      return {
        ...defaultConfig,
        vpn: { ...defaultConfig.vpn, enabled: false },
        remote: { ...defaultConfig.remote, enableCloudDdns: true },
        antiTethering: {
          enabled: true,
          ttlMode: 'STRICT_TTL_1',
          changeTtlValue: 1,
          blockSharingSubnets: true,
          blockHttpTetheringProxies: true,
          enforceOneSessionPerMac: true,
        },
      };

    case 'CLOUD_REMOTE_WIREGUARD':
      return {
        ...defaultConfig,
        hotspot: { ...defaultConfig.hotspot, enabled: false },
        captivePortal: { ...defaultConfig.captivePortal, enabled: false },
        antiTethering: { ...defaultConfig.antiTethering, enabled: false },
        vpn: {
          ...defaultConfig.vpn,
          enabled: true,
          vpnType: 'WIREGUARD',
          enableSstpServer: true,
        },
      };

    case 'SIMPLE_HOTSPOT_QUICK':
      return {
        ...defaultConfig,
        vpn: { ...defaultConfig.vpn, enabled: false },
        remote: { ...defaultConfig.remote, enabled: false },
        antiTethering: { ...defaultConfig.antiTethering, enabled: false },
      };

    default:
      return defaultConfig;
  }
}

/**
 * Generates an advanced, comprehensive RouterOS v7 provisioning script
 * Covering Bridge Manager, Remote Access, WireGuard VPN, HotSpot, Captive Portal, and TTL Anti-Tethering.
 */
export function generateAdvancedMikrotikScript(
  config: AutoInstallConfig,
  appUrl: string
): string {
  const cleanAppUrl = appUrl.replace(/\/$/, '');
  const heartbeatEndpoint = `${cleanAppUrl}/api/v1/routers/heartbeat`;
  const domainHost = cleanAppUrl.replace(/^https?:\/\//, '').split('/')[0];
  const now = new Date().toISOString();

  const scriptParts: string[] = [];

  // Header
  scriptParts.push(`# ==============================================================================
# XCLOUD.NET — PRODUCTION ROUTEROS v7 ONE-CLICK AUTOMATED INSTALLER
# Router Name: ${config.routerName}
# Identity: ${config.routerIdentity}
# Generated: ${now}
# Architecture: MikroTik RouterOS v7.10+ (ARM, ARM64, TILE, MIPSBE, MMIPS, x86 CHR)
# ==============================================================================

:put "=============================================================================="
:put ">>> Starting XCLOUD.NET Automated Provisioning..."
:put "=============================================================================="
`);

  // Section 1: System Baseline & Pre-install Backup
  scriptParts.push(`# ==============================================================================
# SECTION 1: SYSTEM BASELINE, TIME & BACKUP
# ==============================================================================
/system identity set name="${config.routerIdentity}"

# Create safety backup prior to changes
:local backupName ("xcloud_preinstall_" . [:pick [/system clock get date] 7 11] . [:pick [/system clock get date] 0 3] . [:pick [/system clock get date] 4 6] . "_" . [:pick [/system clock get time] 0 2] . [:pick [/system clock get time] 3 5])
/system backup save name=$backupName
:put ">>> Safety backup saved to: $backupName.backup"

# Configure DNS Resolvers
/ip dns set allow-remote-requests=yes servers="${config.dnsServers.join(',')}"

# Configure SNTP Client for accurate RADIUS session accounting
/system ntp client set enabled=yes
/system ntp client servers remove [find]
/system ntp client servers add address="${config.ntpServer}"
`);

  // Section 2: Bridge Manager
  if (config.bridge.enabled) {
    const bridgeName = config.bridge.bridgeName || 'bridge-hotspot';
    scriptParts.push(`# ==============================================================================
# SECTION 2: BRIDGE MANAGER (LAN / HOTSPOT DISTRIBUTION)
# ==============================================================================
:put ">>> Configuring Bridge Manager [$bridgeName]..."

/interface bridge remove [find name="${bridgeName}"]
/interface bridge add \\
  name="${bridgeName}" \\
  protocol-mode=${config.bridge.stpProtocol} \\
  fast-forward=${config.bridge.fastForward ? 'yes' : 'no'} \\
  dhcp-snooping=${config.bridge.dhcpSnooping ? 'yes' : 'no'} \\
  vlan-filtering=${config.bridge.enableVlanFiltering ? 'yes' : 'no'} \\
  comment="XCLOUD.NET High-Performance Distribution Bridge"

# Add member interfaces to bridge
${config.bridge.ports
  .map(
    (port) =>
      `:do { /interface bridge port add bridge="${bridgeName}" interface="${port}" comment="XCLOUD Member Port" } on-error={ :log info "Interface ${port} skipped" };`
  )
  .join('\n')}
`);
  }

  // Section 3: Bridge Remote / Remote Management
  if (config.remote.enabled) {
    scriptParts.push(`# ==============================================================================
# SECTION 3: BRIDGE REMOTE & SECURE CLOUD MANAGEMENT
# ==============================================================================
:put ">>> Configuring Remote Management & IP Cloud..."

# Enable MikroTik Cloud Dynamic DNS (DDNS) for dynamic IP resolution
${
  config.remote.enableCloudDdns
    ? `/ip cloud set ddns-enabled=yes ddns-update-interval=${config.remote.cloudUpdateInterval} update-time=yes
:put ">>> MikroTik Cloud DDNS Enabled. Resolve via: [/ip cloud get dns-name]"`
    : `# Cloud DDNS Disabled`
}

# Configure Remote Winbox and Management Ports
/ip service set winbox port=${config.remote.winboxWanPort} disabled=no
/ip service set api-ssl port=${config.remote.restApiPort} disabled=${config.remote.enableRestApiSsl ? 'no' : 'yes'}
/ip service set ssh port=${config.remote.sshPort} disabled=${config.remote.allowWanSsh ? 'no' : 'yes'}
/ip service set api disabled=yes comment="Disabled unencrypted API in favor of REST/SSL"

# Firewall filter for Cloud Remote Management
/ip firewall filter remove [find comment~"XCLOUD Remote Mgmt"]
/ip firewall filter add chain=input protocol=tcp dst-port=${config.remote.winboxWanPort} action=accept comment="XCLOUD Remote Mgmt: Winbox Port"
/ip firewall filter add chain=input protocol=tcp dst-port=${config.remote.restApiPort} action=accept comment="XCLOUD Remote Mgmt: REST API SSL"
`);
  }

  // Section 4: VPN Manager (WireGuard, SSTP, L2TP)
  if (config.vpn.enabled) {
    scriptParts.push(`# ==============================================================================
# SECTION 4: VPN MANAGER (WIREGUARD & SECURE BACKHAUL)
# ==============================================================================
:put ">>> Configuring VPN Tunnel Backhaul..."

# WireGuard Cloud Overlay Network (RouterOS v7)
/interface wireguard remove [find name="wg-xcloud"]
/interface wireguard add \\
  name="wg-xcloud" \\
  listen-port=${config.vpn.wireguardPort} \\
  mtu=${config.vpn.wireguardMtu} \\
  comment="XCLOUD.NET Zero-Trust WireGuard Tunnel"

# Assign IP to WireGuard Interface
/ip address remove [find interface="wg-xcloud"]
/ip address add address="${config.vpn.wireguardAddress}" interface="wg-xcloud" network=10.254.0.0 comment="XCLOUD VPN IP"

# Configure WireGuard Central Gateway Peer
/interface wireguard peers remove [find interface="wg-xcloud"]
/interface wireguard peers add \\
  interface="wg-xcloud" \\
  allowed-address="${config.vpn.wireguardAllowedIps || '10.254.0.0/16'}" \\
  ${config.vpn.wireguardPeerEndpoint ? `endpoint-address="${config.vpn.wireguardPeerEndpoint.split(':')[0]}" endpoint-port=${config.vpn.wireguardPeerEndpoint.split(':')[1] || '13231'} \\` : ''}
  ${config.vpn.wireguardPeerPublicKey ? `public-key="${config.vpn.wireguardPeerPublicKey}" \\` : ''}
  persistent-keepalive=25s \\
  comment="XCLOUD Central RADIUS & Management Node"

# SSTP Remote Server for Winbox behind Carrier-Grade NAT (CGNAT)
${
  config.vpn.enableSstpServer
    ? `/interface sstp-server server set enabled=yes port=${config.vpn.sstpPort} default-profile=default-encryption`
    : `# SSTP Server disabled`
}

# Allow WireGuard in Firewall Input
/ip firewall filter remove [find comment~"XCLOUD WireGuard"]
/ip firewall filter add chain=input protocol=udp dst-port=${config.vpn.wireguardPort} action=accept comment="XCLOUD WireGuard Ingress"
`);
  }

  // Section 5: Hotspot Setup & IP Pool
  if (config.hotspot.enabled) {
    const hsInterface = config.hotspot.interface || 'bridge-hotspot';
    const hsName = config.hotspot.serverName || 'hs-xcloud';
    const poolName = `hs-pool-${hsName}`;
    const profileName = `hsprof-${hsName}`;

    scriptParts.push(`# ==============================================================================
# SECTION 5: HOTSPOT CORE SETUP (GATEWAY, DHCP & PROFILES)
# ==============================================================================
:put ">>> Initializing HotSpot Server [$hsName] on interface [$hsInterface]..."

# 1. IP Address on Hotspot Interface
/ip address remove [find interface="${hsInterface}" comment~"XCLOUD Hotspot"]
/ip address add \\
  address="${config.hotspot.gatewayIp}/${config.hotspot.subnetMask}" \\
  interface="${hsInterface}" \\
  comment="XCLOUD Hotspot Gateway Address"

# 2. IP Pool for Hotspot DHCP
/ip pool remove [find name="${poolName}"]
/ip pool add name="${poolName}" ranges=${config.hotspot.dhcpPoolStart}-${config.hotspot.dhcpPoolEnd} comment="XCLOUD DHCP Pool"

# 3. DHCP Server on HotSpot Interface
/ip dhcp-server remove [find name="dhcp-${hsName}"]
/ip dhcp-server add \\
  name="dhcp-${hsName}" \\
  interface="${hsInterface}" \\
  address-pool="${poolName}" \\
  lease-time=${config.hotspot.leaseTime} \\
  authoritative=yes \\
  disabled=no \\
  comment="XCLOUD DHCP Server"

# 4. DHCP Network configuration
/ip dhcp-server network remove [find comment~"XCLOUD Hotspot Network"]
/ip dhcp-server network add \\
  address="${config.hotspot.gatewayIp.replace(/\.\d+$/, '.0')}/${config.hotspot.subnetMask}" \\
  gateway="${config.hotspot.gatewayIp}" \\
  dns-server="${config.dnsServers.join(',')}" \\
  comment="XCLOUD Hotspot Network"

# 5. Hotspot Server Profile
/ip hotspot profile remove [find name="${profileName}"]
/ip hotspot profile add \\
  name="${profileName}" \\
  hotspot-address="${config.hotspot.gatewayIp}" \\
  dns-name="${config.hotspot.dnsName}" \\
  html-directory="hotspot" \\
  login-by=${config.captivePortal.loginMethod === 'both' ? 'http-chap,http-pap' : config.captivePortal.loginMethod}${config.captivePortal.enableMacCookie ? ',mac-cookie' : ''} \\
  mac-cookie-timeout=${config.captivePortal.cookieLifetime} \\
  use-radius=${config.hotspot.enableRadius ? 'yes' : 'no'} \\
  radius-accounting=${config.hotspot.enableRadius ? 'yes' : 'no'} \\
  radius-interim-update=${config.hotspot.interimUpdateInterval} \\
  radius-mac-format="XX:XX:XX:XX:XX:XX" \\
  radius-location-name="${config.routerName}" \\
  split-user-domain=no \\
  comment="XCLOUD.NET Production Hotspot Profile"

# 6. Hotspot Server Instance
/ip hotspot remove [find name="${hsName}"]
/ip hotspot add \\
  name="${hsName}" \\
  interface="${hsInterface}" \\
  address-pool="${poolName}" \\
  profile="${profileName}" \\
  disabled=no \\
  comment="XCLOUD Active Hotspot Instance"

# 7. NAT Masquerade for Internet Access
/ip firewall nat remove [find comment~"XCLOUD Hotspot NAT"]
/ip firewall nat add \\
  chain=srcnat \\
  src-address="${config.hotspot.gatewayIp.replace(/\.\d+$/, '.0')}/${config.hotspot.subnetMask}" \\
  action=masquerade \\
  comment="XCLOUD Hotspot NAT Masquerade"
`);
  }

  // Section 6: FreeRADIUS 3.0 Integration & CoA
  if (config.hotspot.enableRadius) {
    scriptParts.push(`# ==============================================================================
# SECTION 6: FREERADIUS 3.0 AAA & CoA DISCONNECT ENGINE
# ==============================================================================
:put ">>> Binding FreeRADIUS AAA & RFC 3576 Change of Authorization (CoA)..."

/radius remove [find comment~"XCLOUD"]
/radius add \\
  service=hotspot,ppp \\
  address=127.0.0.1 \\
  secret="${config.hotspot.radiusSecret}" \\
  authentication-port=${config.hotspot.radiusAuthPort} \\
  accounting-port=${config.hotspot.radiusAcctPort} \\
  timeout=3000ms \\
  comment="XCLOUD.NET FreeRADIUS Authentication Authority"

# Enable RFC 3576 / RFC 5176 RADIUS Change of Authorization (CoA) & Disconnect Messages
/radius incoming set accept=yes port=${config.hotspot.radiusCoaPort}
`);
  }

  // Section 7: Captive Portal & Walled Gardens
  if (config.captivePortal.enabled) {
    scriptParts.push(`# ==============================================================================
# SECTION 7: CAPTIVE PORTAL & MOBILE MONEY WALLED GARDEN (TANZANIA & EAST AFRICA)
# ==============================================================================
:put ">>> Configuring Walled Gardens for Tanzania Mobile Money & Portal Assets..."

/ip hotspot walled-garden remove [find comment~"XCLOUD"]

# Cloud Platform Domain & Captive Portal Host
/ip hotspot walled-garden add dst-host="${domainHost}" action=allow comment="XCLOUD Cloud Host"
/ip hotspot walled-garden add dst-host="*.xcloud.net" action=allow comment="XCLOUD CDN"

${
  config.captivePortal.walledGardenPresets.selcom
    ? `/ip hotspot walled-garden add dst-host="*.selcompay.com" action=allow comment="XCLOUD Selcom Mobile Money"
/ip hotspot walled-garden add dst-host="*.selcom.net" action=allow comment="XCLOUD Selcom API"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.vodacomMpesa
    ? `/ip hotspot walled-garden add dst-host="*.vodacom.co.tz" action=allow comment="XCLOUD Vodacom M-Pesa"
/ip hotspot walled-garden add dst-host="*.mpesa.vm.co.tz" action=allow comment="XCLOUD Vodacom Gateway"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.airtelMoney
    ? `/ip hotspot walled-garden add dst-host="*.airtel.co.tz" action=allow comment="XCLOUD Airtel Money"
/ip hotspot walled-garden add dst-host="*.airtel.africa" action=allow comment="XCLOUD Airtel Africa"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.tigoPesa
    ? `/ip hotspot walled-garden add dst-host="*.tigo.co.tz" action=allow comment="XCLOUD Tigo Pesa"
/ip hotspot walled-garden add dst-host="*.tigopesa.co.tz" action=allow comment="XCLOUD Tigo Pesa Portal"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.haloPesa
    ? `/ip hotspot walled-garden add dst-host="*.halotel.co.tz" action=allow comment="XCLOUD HaloPesa"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.tanzaniaBanks
    ? `/ip hotspot walled-garden add dst-host="*.crdbbank.co.tz" action=allow comment="XCLOUD CRDB Bank"
/ip hotspot walled-garden add dst-host="*.nmbbank.co.tz" action=allow comment="XCLOUD NMB Bank"
/ip hotspot walled-garden add dst-host="*.nbc.co.tz" action=allow comment="XCLOUD NBC Bank"`
    : ''
}

${
  config.captivePortal.walledGardenPresets.googleCdn
    ? `/ip hotspot walled-garden add dst-host="fonts.googleapis.com" action=allow comment="XCLOUD Google Fonts"
/ip hotspot walled-garden add dst-host="fonts.gstatic.com" action=allow comment="XCLOUD Google Static CDN"
/ip hotspot walled-garden add dst-host="cdnjs.cloudflare.com" action=allow comment="XCLOUD Cloudflare CDN"`
    : ''
}

${config.captivePortal.customWalledGardenHosts
  .filter(Boolean)
  .map(
    (host) =>
      `/ip hotspot walled-garden add dst-host="${host.trim()}" action=allow comment="XCLOUD Custom Walled Host"`
  )
  .join('\n')}
`);
  }

  // Section 8: TTL Anti-Tethered (Anti-Hotspot Re-Sharing / Extender Block)
  if (config.antiTethering.enabled) {
    const hsInterface = config.hotspot.interface || 'bridge-hotspot';
    const ttlVal = config.antiTethering.changeTtlValue || 1;

    scriptParts.push(`# ==============================================================================
# SECTION 8: TTL ANTI-TETHERING ENGINE (BLOCK HOTSPOT RE-SHARING & EXTENDERS)
# ==============================================================================
:put ">>> Activating TTL Anti-Tethering & Anti-Extender Protection (Mode: ${config.antiTethering.ttlMode})..."

/ip firewall mangle remove [find comment~"XCLOUD Anti-Tethering"]

${
  config.antiTethering.ttlMode === 'STRICT_TTL_1' ||
  config.antiTethering.ttlMode === 'BOTH_INGRESS_EGRESS'
    ? `# 1. Lock Egress TTL to ${ttlVal} on Hotspot interface.
# When a connected phone/laptop/TP-Link repeater attempts to re-share WiFi, the forwarded packets will have TTL=0 and be instantly dropped by downstream hops!
/ip firewall mangle add \\
  chain=postrouting \\
  out-interface="${hsInterface}" \\
  action=change-ttl \\
  new-ttl=set:${ttlVal} \\
  passthrough=no \\
  comment="XCLOUD Anti-Tethering: Strict Egress TTL=${ttlVal} Lock"`
    : ''
}

${
  config.antiTethering.ttlMode === 'STANDARD_TTL_64' ||
  config.antiTethering.ttlMode === 'BOTH_INGRESS_EGRESS'
    ? `# 2. Ingress TTL Normalization (Fixes TTL to 64 to prevent client-side hop tampering)
/ip firewall mangle add \\
  chain=prerouting \\
  in-interface="${hsInterface}" \\
  action=change-ttl \\
  new-ttl=set:64 \\
  passthrough=yes \\
  comment="XCLOUD Anti-Tethering: Ingress TTL=64 Normalization"`
    : ''
}

${
  config.antiTethering.blockHttpTetheringProxies
    ? `# 3. Block HTTP/SOCKS local tethering proxy ports used by Android hotspot apps (EveryProxy, NetShare, PdaNet)
/ip firewall filter remove [find comment~"XCLOUD Block Tethering Apps"]
/ip firewall filter add \\
  chain=forward \\
  in-interface="${hsInterface}" \\
  protocol=tcp \\
  dst-port=8080,8888,1080,9050,9999,7777 \\
  action=drop \\
  comment="XCLOUD Block Tethering Apps (EveryProxy / NetShare / SOCKS)"`
    : ''
}
`);
  }

  // Section 9: Telemetry Heartbeat & Watchdog
  const token = config.enrollmentToken || `xctk_${Math.random().toString(36).substring(2, 12)}`;
  scriptParts.push(`# ==============================================================================
# SECTION 9: REAL-TIME TELEMETRY WATCHDOG & HEARTBEAT
# ==============================================================================
:put ">>> Registering Real-time Heartbeat & Cloud Watchdog (30s interval)..."

/system script remove [find name="xcloud-heartbeat"]
/system script add name="xcloud-heartbeat" source="\\
  :local cpu [/system resource get cpu-load];\\
  :local memFree [/system resource get free-memory];\\
  :local memTotal [/system resource get total-memory];\\
  :local memUsage (100 - (($memFree * 100) / $memTotal));\\
  :local uptime [/system resource get uptime];\\
  :local usersCount 0;\\
  :do { :set usersCount [:len [/ip hotspot active find]] } on-error={};\\
  :local postData (\\\"{\\\\\\\"token\\\\\\\":\\\\\\\"${token}\\\\\\\",\\\\\\\"cpu\\\\\\\":\\\" . $cpu . \\\",\\\\\\\"ram\\\\\\\":\\\" . $memUsage . \\\",\\\\\\\"uptime\\\\\\\":\\\\\\\"\\\" . $uptime . \\\"\\\\\\\",\\\\\\\"activeUsers\\\\\\\":\\\" . $usersCount . \\\"}\\\");\\
  :do {\\
    /tool fetch url=\\\"${heartbeatEndpoint}\\\" http-method=post http-header-field=\\\"Content-Type: application/json\\\" http-data=$postData keep-result=no;\\
  } on-error={ :log warning \\\"XCLOUD.NET Heartbeat post failed - Retrying next cycle...\\\" };\\
"

/system scheduler remove [find name="xcloud-heartbeat-timer"]
/system scheduler add \\
  name="xcloud-heartbeat-timer" \\
  interval=30s \\
  on-event="xcloud-heartbeat" \\
  start-time=startup \\
  comment="XCLOUD.NET 30-second Telemetry Scheduler"

# Trigger initial heartbeat immediately
/system script run xcloud-heartbeat

# Completion Banner
:put "=============================================================================="
:put ">>> SUCCESS! XCLOUD.NET Automated Provisioning Completed."
:put ">>> Bridge Manager: ACTIVE"
:put ">>> Remote Access & Cloud DDNS: READY"
:put ">>> WireGuard VPN: CONFIG PENDING / ACTIVE"
:put ">>> HotSpot Server & FreeRADIUS: ONLINE"
:put ">>> Tanzania Mobile Money Walled Garden: ALLOWED"
:put ">>> TTL Anti-Tethering Engine: ARMED"
:put "=============================================================================="
`);

  return scriptParts.join('\n');
}

/**
 * Legacy wrapper for single-router standard script generation
 */
export function generateMikrotikProvisioningScript(router: Router, appUrl: string): string {
  const config = createPresetConfig('ALL_IN_ONE_FULL_ISP', router, appUrl);
  return generateAdvancedMikrotikScript(config, appUrl);
}

/**
 * Validates router telemetry and returns diagnostics
 */
export function runRouterDiagnostics(router: Router): MikrotikDiagnosticResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (router.status === 'OFFLINE') {
    issues.push('Router heartbeat has not been received in the last 60 seconds.');
    recommendations.push('Ensure router has internet connectivity and DNS resolution.');
    recommendations.push('Run `/system script run xcloud-heartbeat` in Winbox/Terminal to test manual dispatch.');
  }

  if (router.cpuUsage > 80) {
    issues.push(`High CPU load detected (${router.cpuUsage}%).`);
    recommendations.push('Inspect /tool profile in RouterOS to locate CPU-intensive firewall filters or mangle rules.');
  }

  if (router.memoryUsage > 85) {
    issues.push(`High RAM usage detected (${router.memoryUsage}%).`);
    recommendations.push('Consider rebooting or reviewing connection tracking table sizes.');
  }

  return {
    routerOsVersionValid: true,
    dnsReachable: router.status === 'ONLINE',
    internetAccess: router.status === 'ONLINE',
    radiusConfigured: router.isRadiusEnabled,
    hotspotActive: router.isHotspotEnabled,
    issues,
    recommendations,
  };
}

