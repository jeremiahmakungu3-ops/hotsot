// XCLOUD.NET — Core TypeScript Definitions & Domain Models

export type RoleType =
  | 'SUPER_ADMIN'
  | 'ISP_OWNER'
  | 'ADMINISTRATOR'
  | 'NETWORK_ENGINEER'
  | 'BILLING_MANAGER'
  | 'AGENT'
  | 'POS_OPERATOR'
  | 'SUPPORT_STAFF'
  | 'CUSTOMER';

export type RouterStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'PROVISIONING';

export type ConnectionMethod = 'REST_API' | 'WINBOX_API' | 'WIREGUARD' | 'DIRECT_IP';

export type VoucherStatus = 'GENERATED' | 'UNUSED' | 'REDEEMED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'CALLBACK_RECEIVED'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethodType =
  | 'MPESA'
  | 'AIRTEL_MONEY'
  | 'TIGO_PESA'
  | 'HALOPESA'
  | 'SELCOM'
  | 'CASH_POS'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD';

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';

export type PackageType =
  | 'HOTSPOT_TIME'
  | 'HOTSPOT_DATA'
  | 'HOTSPOT_UNLIMITED'
  | 'PPPOE_MONTHLY'
  | 'BANDWIDTH_BURST';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  currency: string;
  logoUrl?: string;
  address?: string;
  isActive: boolean;
  settings?: {
    brandName?: string;
    supportContact?: string;
    walledGardenHosts?: string[];
    smsSenderId?: string;
    allowSelfRegistration?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId?: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  role: RoleType;
  isEmailVerified: boolean;
  isTwoFactorActive: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export interface Router {
  id: string;
  tenantId: string;
  name: string;
  identity?: string;
  model?: string;
  routerOsVersion?: string;
  ipAddress: string;
  publicIp?: string;
  apiPort: number;
  restPort: number;
  location?: string;
  connectionMethod: ConnectionMethod;
  enrollmentToken: string;
  isEnrolled: boolean;
  status: RouterStatus;
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  activeUsersCount: number;
  lastHeartbeatAt?: string;
  wireguardIp?: string;
  radiusSecret: string;
  isRadiusEnabled: boolean;
  isHotspotEnabled: boolean;
  isPppoeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  interfaces?: RouterInterface[];
}

export interface RouterInterface {
  id: string;
  routerId: string;
  name: string;
  type: string;
  macAddress?: string;
  rxBytes: number;
  txBytes: number;
  isUp: boolean;
}

export interface Package {
  id: string;
  tenantId: string;
  name: string;
  type: PackageType;
  price: number;
  currency: string;
  durationSeconds: number; // e.g. 3600 (1 Hour), 86400 (24h)
  validityDays: number;
  uploadSpeedKbps: number;
  downloadSpeedKbps: number;
  dataLimitBytes?: number | null; // in bytes, null for unlimited
  simultaneousSessions: number;
  mikrotikRateLimit: string; // e.g. "5M/10M"
  description?: string;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface VoucherBatch {
  id: string;
  tenantId: string;
  batchNumber: string;
  packageId: string;
  packageName?: string;
  quantity: number;
  usedCount: number;
  prefix?: string;
  notes?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  tenantId: string;
  batchId?: string;
  packageId: string;
  packageName?: string;
  packagePrice?: number;
  packageDurationSeconds?: number;
  packageRateLimit?: string;
  routerId?: string;
  agentId?: string;
  agentName?: string;
  code: string;
  pin?: string;
  qrCodeData?: string;
  status: VoucherStatus;
  activatedAt?: string;
  expiresAt?: string;
  usedBytes: number;
  usedSeconds: number;
  redeemedByCustomer?: string;
  redeemedMacAddress?: string;
  redeemedIpAddress?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  userId?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  accountNumber: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  staticIp?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface HotspotSession {
  id: string;
  tenantId: string;
  routerId: string;
  routerName?: string;
  voucherId?: string;
  customerId?: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  startedAt: string;
  durationSeconds: number;
  bytesIn: number;
  bytesOut: number;
  isActive: boolean;
  rateLimitApplied?: string;
  uptimeFormatted?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName?: string;
  packageId?: string;
  packageName?: string;
  agentId?: string;
  paymentReference: string;
  providerTxId?: string;
  method: PaymentMethodType;
  amount: number;
  currency: string;
  phoneNumber: string;
  status: PaymentStatus;
  verifiedAt?: string;
  createdAt: string;
  rawCallbackData?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  tenantId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  agentCode: string;
  commissionRate: number; // e.g. 5%
  walletBalance: number;
  totalSales: number;
  totalCommission: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AgentCommission {
  id: string;
  agentId: string;
  amount: number;
  rate: number;
  saleAmount: number;
  reason?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  packageId?: string;
  packageName?: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  billingCycle: string;
  price: number;
  startDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  paymentMethod: PaymentMethodType;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  result: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface DashboardMetrics {
  revenueToday: number;
  revenueThisMonth: number;
  activeCustomers: number;
  activeHotspotUsers: number;
  onlineRouters: number;
  offlineRouters: number;
  activeVouchers: number;
  totalVouchers: number;
  agentSalesToday: number;
  bandwidthUsageGb: number;
  dailyRevenueChart: { date: string; amount: number }[];
  hourlyTrafficChart: { time: string; downloadMbps: number; uploadMbps: number }[];
  paymentMethodBreakdown: { name: string; count: number; value: number }[];
  packageSalesBreakdown: { name: string; sales: number }[];
}

export interface WebSocketEvent {
  type:
    | 'ROUTER_HEARTBEAT'
    | 'SESSION_START'
    | 'SESSION_STOP'
    | 'PAYMENT_COMPLETED'
    | 'VOUCHER_REDEEMED'
    | 'ALERT'
    | 'POS_SALE';
  payload: Record<string, unknown>;
  timestamp: string;
}

export type TtlMode = 'STRICT_TTL_1' | 'STANDARD_TTL_64' | 'BOTH_INGRESS_EGRESS';

export interface AutoInstallConfig {
  routerId?: string;
  routerName: string;
  routerIdentity: string;
  hardwareModel?: string;
  adminPassword?: string;
  enrollmentToken?: string;
  dnsServers: string[];
  ntpServer: string;

  // 1. Bridge Manager
  bridge: {
    enabled: boolean;
    bridgeName: string;
    ports: string[];
    enableVlanFiltering: boolean;
    vlanId?: number;
    stpProtocol: 'rstp' | 'stp' | 'none';
    fastForward: boolean;
    dhcpSnooping: boolean;
  };

  // 2. Bridge Remote / Remote Management
  remote: {
    enabled: boolean;
    enableCloudDdns: boolean;
    cloudUpdateInterval: string;
    enableBackToHome: boolean;
    winboxWanPort: number;
    enableRestApiSsl: boolean;
    restApiPort: number;
    allowWanWinbox: boolean;
    allowWanSsh: boolean;
    sshPort: number;
  };

  // 3. VPN Manager
  vpn: {
    enabled: boolean;
    vpnType: 'WIREGUARD' | 'SSTP' | 'L2TP_IPSEC' | 'ALL';
    wireguardPort: number;
    wireguardAddress: string;
    wireguardMtu: number;
    wireguardPeerEndpoint?: string;
    wireguardPeerPublicKey?: string;
    wireguardAllowedIps?: string;
    enableSstpServer: boolean;
    sstpPort: number;
    enableL2tpServer: boolean;
  };

  // 4. Hotspot Setup
  hotspot: {
    enabled: boolean;
    serverName: string;
    interface: string;
    gatewayIp: string;
    subnetMask: string;
    dhcpPoolStart: string;
    dhcpPoolEnd: string;
    dnsName: string;
    leaseTime: string;
    enableRadius: boolean;
    radiusSecret: string;
    radiusAuthPort: number;
    radiusAcctPort: number;
    radiusCoaPort: number;
    interimUpdateInterval: string;
  };

  // 5. Captive Portal & Walled Gardens
  captivePortal: {
    enabled: boolean;
    loginMethod: 'http-chap' | 'http-pap' | 'both';
    enableMacCookie: boolean;
    cookieLifetime: string;
    customPortalUrl?: string;
    cloudLoginRedirect: boolean;
    walledGardenPresets: {
      selcom: boolean;
      vodacomMpesa: boolean;
      airtelMoney: boolean;
      tigoPesa: boolean;
      haloPesa: boolean;
      tanzaniaBanks: boolean;
      googleCdn: boolean;
      cloudPlatform: boolean;
    };
    customWalledGardenHosts: string[];
  };

  // 6. TTL Anti-Tethered
  antiTethering: {
    enabled: boolean;
    ttlMode: TtlMode;
    changeTtlValue: number;
    blockSharingSubnets: boolean;
    blockHttpTetheringProxies: boolean;
    enforceOneSessionPerMac: boolean;
  };
}

export type AutoInstallPreset =
  | 'ALL_IN_ONE_FULL_ISP'
  | 'SECURE_HOTSPOT_ANTI_TETHER'
  | 'CLOUD_REMOTE_WIREGUARD'
  | 'SIMPLE_HOTSPOT_QUICK';

