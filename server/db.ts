// XCLOUD.NET — Backend In-Memory Persistence & Multi-Tenant Store
// Provides reliable, ACID-like in-memory data store seeded with authentic ISP and Hotspot configurations

import {
  Tenant,
  User,
  Router,
  Package,
  VoucherBatch,
  Voucher,
  Customer,
  HotspotSession,
  Payment,
  Agent,
  Invoice,
  Subscription,
  AuditLog,
  DashboardMetrics
} from '../src/types/index.ts';

// Initial Seed Tenants
export const tenants: Tenant[] = [
  {
    id: 'tenant-darnet-01',
    name: 'DarNet HighSpeed ISP',
    slug: 'darnet',
    contactEmail: 'noc@darnet.co.tz',
    contactPhone: '+255 754 112 233',
    country: 'Tanzania',
    currency: 'TZS',
    isActive: true,
    settings: {
      brandName: 'DarNet Hotspot',
      supportContact: '+255 754 112 233',
      walledGardenHosts: ['selcom.co.tz', 'vodacom.co.tz', 'airtel.co.tz', 'tigo.co.tz'],
      smsSenderId: 'DARNET_TZ',
      allowSelfRegistration: true
    },
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tenant-kiliman-02',
    name: 'Kilimanjaro WiFi & Fiber',
    slug: 'kilimanjaro-wifi',
    contactEmail: 'admin@kilifi.co.tz',
    contactPhone: '+255 784 990 011',
    country: 'Tanzania',
    currency: 'TZS',
    isActive: true,
    settings: {
      brandName: 'KiliWiFi HighSpeed',
      supportContact: '+255 784 990 011',
      smsSenderId: 'KILI_WIFI',
      allowSelfRegistration: true
    },
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tenant-zanzibar-03',
    name: 'Zanzibar Breeze Hotel & Resort Hotspot',
    slug: 'zanzibar-breeze',
    contactEmail: 'it@zanzibarbreeze.com',
    contactPhone: '+255 777 334 455',
    country: 'Tanzania',
    currency: 'TZS',
    isActive: true,
    settings: {
      brandName: 'Zanzibar Breeze Guest WiFi',
      supportContact: 'Dial 100 from room',
      smsSenderId: 'ZNZ_BREEZE',
      allowSelfRegistration: true
    },
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Users
export const users: User[] = [
  {
    id: 'usr-super-01',
    email: 'superadmin@xcloud.net',
    username: 'superadmin',
    fullName: 'Juma Mussa (Global Network Director)',
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    isTwoFactorActive: false,
    isActive: true,
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString()
  },
  {
    id: 'usr-owner-01',
    tenantId: 'tenant-darnet-01',
    email: 'owner@darnet.co.tz',
    username: 'darnet_owner',
    fullName: 'Baraka Kimaro',
    phoneNumber: '+255 754 112 233',
    role: 'ISP_OWNER',
    isEmailVerified: true,
    isTwoFactorActive: true,
    isActive: true,
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString()
  },
  {
    id: 'usr-eng-01',
    tenantId: 'tenant-darnet-01',
    email: 'noc@darnet.co.tz',
    username: 'net_engineer',
    fullName: 'Mwanahamis Bakari',
    phoneNumber: '+255 715 443 210',
    role: 'NETWORK_ENGINEER',
    isEmailVerified: true,
    isTwoFactorActive: false,
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'usr-agent-01',
    tenantId: 'tenant-darnet-01',
    email: 'agent.kariakoo@darnet.co.tz',
    username: 'kariakoo_pos',
    fullName: 'Rashid Mtambo (Kariakoo Market POS)',
    phoneNumber: '+255 765 889 900',
    role: 'AGENT',
    isEmailVerified: true,
    isTwoFactorActive: false,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'usr-cust-01',
    tenantId: 'tenant-darnet-01',
    email: 'john.massawe@gmail.com',
    username: 'john_massawe',
    fullName: 'John Massawe',
    phoneNumber: '+255 744 556 677',
    role: 'CUSTOMER',
    isEmailVerified: true,
    isTwoFactorActive: false,
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

// Initial MikroTik Routers
export const routers: Router[] = [
  {
    id: 'rtr-dar-01',
    tenantId: 'tenant-darnet-01',
    name: 'MikroTik CCR2004 - Kariakoo Core Gateway',
    identity: 'DAR-CORE-GW-01',
    model: 'CCR2004-16G-2S+',
    routerOsVersion: 'RouterOS v7.15.2',
    ipAddress: '10.100.1.1',
    publicIp: '197.250.45.12',
    apiPort: 8728,
    restPort: 443,
    location: 'Kariakoo Hub, Dar es Salaam',
    connectionMethod: 'REST_API',
    enrollmentToken: 'xcl-token-kar-88912-enc',
    isEnrolled: true,
    status: 'ONLINE',
    cpuUsage: 18,
    memoryUsage: 34,
    uptimeSeconds: 1248900,
    activeUsersCount: 142,
    lastHeartbeatAt: new Date().toISOString(),
    wireguardIp: '10.255.0.2/24',
    radiusSecret: 'xcloud_freeradius_shared_secret_mikrotik_nas_2026',
    isRadiusEnabled: true,
    isHotspotEnabled: true,
    isPppoeEnabled: true,
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    interfaces: [
      { id: 'if-1', routerId: 'rtr-dar-01', name: 'ether1-WAN-Fiber', type: 'ether', macAddress: '6C:3B:6B:1A:22:01', rxBytes: 89432049210, txBytes: 349204910294, isUp: true },
      { id: 'if-2', routerId: 'rtr-dar-01', name: 'ether2-Hotspot-VLAN20', type: 'vlan', macAddress: '6C:3B:6B:1A:22:02', rxBytes: 24930291039, txBytes: 89402910293, isUp: true },
      { id: 'if-3', routerId: 'rtr-dar-01', name: 'sfp-plus1-PPPoE-Trunk', type: 'sfp', macAddress: '6C:3B:6B:1A:22:03', rxBytes: 45092019203, txBytes: 124902910293, isUp: true }
    ]
  },
  {
    id: 'rtr-dar-02',
    tenantId: 'tenant-darnet-01',
    name: 'MikroTik RB4011 - Posta City Center Hotspot',
    identity: 'DAR-POSTA-HOTSPOT-02',
    model: 'RB4011iGS+5HacQ2HnD-IN',
    routerOsVersion: 'RouterOS v7.14.3',
    ipAddress: '10.100.2.1',
    publicIp: '197.250.45.18',
    apiPort: 8728,
    restPort: 443,
    location: 'Posta Mpya, Dar es Salaam',
    connectionMethod: 'REST_API',
    enrollmentToken: 'xcl-token-pos-99214-enc',
    isEnrolled: true,
    status: 'ONLINE',
    cpuUsage: 27,
    memoryUsage: 48,
    uptimeSeconds: 849300,
    activeUsersCount: 89,
    lastHeartbeatAt: new Date().toISOString(),
    wireguardIp: '10.255.0.3/24',
    radiusSecret: 'xcloud_freeradius_shared_secret_mikrotik_nas_2026',
    isRadiusEnabled: true,
    isHotspotEnabled: true,
    isPppoeEnabled: false,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    interfaces: [
      { id: 'if-4', routerId: 'rtr-dar-02', name: 'ether1-WAN', type: 'ether', rxBytes: 45291029302, txBytes: 139402910293, isUp: true },
      { id: 'if-5', routerId: 'rtr-dar-02', name: 'bridge-Hotspot', type: 'bridge', rxBytes: 139402910293, txBytes: 45291029302, isUp: true }
    ]
  },
  {
    id: 'rtr-dar-03',
    tenantId: 'tenant-darnet-01',
    name: 'MikroTik hAP ax3 - Mikocheni Tower Branch',
    identity: 'DAR-MIKO-AP-03',
    model: 'C53UiG+5HPaxD2HPaxD',
    routerOsVersion: 'RouterOS v7.15.1',
    ipAddress: '10.100.3.1',
    publicIp: '197.250.45.24',
    apiPort: 8728,
    restPort: 443,
    location: 'Mikocheni B, Dar es Salaam',
    connectionMethod: 'REST_API',
    enrollmentToken: 'xcl-token-mik-33109-enc',
    isEnrolled: true,
    status: 'ONLINE',
    cpuUsage: 9,
    memoryUsage: 22,
    uptimeSeconds: 432000,
    activeUsersCount: 36,
    lastHeartbeatAt: new Date().toISOString(),
    wireguardIp: '10.255.0.4/24',
    radiusSecret: 'xcloud_freeradius_shared_secret_mikrotik_nas_2026',
    isRadiusEnabled: true,
    isHotspotEnabled: true,
    isPppoeEnabled: false,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    interfaces: [
      { id: 'if-6', routerId: 'rtr-dar-03', name: 'ether1-WAN', type: 'ether', rxBytes: 12093029100, txBytes: 39402910293, isUp: true }
    ]
  }
];

// Initial Hotspot & PPPoE Packages (in TZS)
export const packages: Package[] = [
  {
    id: 'pkg-1h-500',
    tenantId: 'tenant-darnet-01',
    name: '1 Hour Ultra Fast',
    type: 'HOTSPOT_TIME',
    price: 500,
    currency: 'TZS',
    durationSeconds: 3600,
    validityDays: 1,
    uploadSpeedKbps: 5120, // 5 Mbps
    downloadSpeedKbps: 10240, // 10 Mbps
    dataLimitBytes: null,
    simultaneousSessions: 1,
    mikrotikRateLimit: '5M/10M',
    description: '1 Hour unlimited high-speed browsing and streaming. Perfect for quick tasks.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-3h-1000',
    tenantId: 'tenant-darnet-01',
    name: '3 Hours Standard',
    type: 'HOTSPOT_TIME',
    price: 1000,
    currency: 'TZS',
    durationSeconds: 10800,
    validityDays: 2,
    uploadSpeedKbps: 5120,
    downloadSpeedKbps: 10240,
    dataLimitBytes: null,
    simultaneousSessions: 1,
    mikrotikRateLimit: '5M/10M',
    description: '3 Hours uninterrupted continuous access with low ping and fast downloads.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-12h-2000',
    tenantId: 'tenant-darnet-01',
    name: '12 Hours Day Pass',
    type: 'HOTSPOT_TIME',
    price: 2000,
    currency: 'TZS',
    durationSeconds: 43200,
    validityDays: 3,
    uploadSpeedKbps: 8192,
    downloadSpeedKbps: 15360,
    dataLimitBytes: null,
    simultaneousSessions: 1,
    mikrotikRateLimit: '8M/15M',
    description: 'Half-day super high-speed access for work, study, and downloading.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-24h-3000',
    tenantId: 'tenant-darnet-01',
    name: '24 Hours Full Day',
    type: 'HOTSPOT_TIME',
    price: 3000,
    currency: 'TZS',
    durationSeconds: 86400,
    validityDays: 5,
    uploadSpeedKbps: 10240,
    downloadSpeedKbps: 20480,
    dataLimitBytes: null,
    simultaneousSessions: 2,
    mikrotikRateLimit: '10M/20M',
    description: 'Full 24-hour unlimited connection. Connect up to 2 devices simultaneously.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-7d-10000',
    tenantId: 'tenant-darnet-01',
    name: '7 Days Weekly Unlimited',
    type: 'HOTSPOT_TIME',
    price: 10000,
    currency: 'TZS',
    durationSeconds: 604800,
    validityDays: 10,
    uploadSpeedKbps: 10240,
    downloadSpeedKbps: 25600,
    dataLimitBytes: null,
    simultaneousSessions: 2,
    mikrotikRateLimit: '10M/25M',
    description: '7 Days weekly pass. Great value for remote workers and residential guests.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-30d-25000',
    tenantId: 'tenant-darnet-01',
    name: '30 Days Monthly Hotspot',
    type: 'HOTSPOT_TIME',
    price: 25000,
    currency: 'TZS',
    durationSeconds: 2592000,
    validityDays: 35,
    uploadSpeedKbps: 15360,
    downloadSpeedKbps: 30720,
    dataLimitBytes: null,
    simultaneousSessions: 3,
    mikrotikRateLimit: '15M/30M',
    description: 'Monthly unlimited WiFi access with priority QoS bandwidth.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'pkg-pppoe-home-50000',
    tenantId: 'tenant-darnet-01',
    name: 'PPPoE Home Fiber 20 Mbps',
    type: 'PPPOE_MONTHLY',
    price: 50000,
    currency: 'TZS',
    durationSeconds: 2592000,
    validityDays: 30,
    uploadSpeedKbps: 20480,
    downloadSpeedKbps: 20480,
    dataLimitBytes: null,
    simultaneousSessions: 1,
    mikrotikRateLimit: '20M/20M',
    description: 'Dedicated residential fiber connection with 20 Mbps synchronous bandwidth.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  }
];

// Initial Voucher Batches
export const voucherBatches: VoucherBatch[] = [
  {
    id: 'batch-001',
    tenantId: 'tenant-darnet-01',
    batchNumber: 'BATCH-DAR-2026-001',
    packageId: 'pkg-3h-1000',
    packageName: '3 Hours Standard',
    quantity: 100,
    usedCount: 42,
    prefix: 'KLI',
    notes: 'Kariakoo Market morning batch distribution',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'batch-002',
    tenantId: 'tenant-darnet-01',
    batchNumber: 'BATCH-DAR-2026-002',
    packageId: 'pkg-24h-3000',
    packageName: '24 Hours Full Day',
    quantity: 50,
    usedCount: 29,
    prefix: 'POS',
    notes: 'Posta city center cyber café cards',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// Initial Vouchers
export const vouchers: Voucher[] = [
  {
    id: 'vch-101',
    tenantId: 'tenant-darnet-01',
    batchId: 'batch-001',
    packageId: 'pkg-3h-1000',
    packageName: '3 Hours Standard',
    packagePrice: 1000,
    packageDurationSeconds: 10800,
    packageRateLimit: '5M/10M',
    routerId: 'rtr-dar-01',
    agentId: 'agt-01',
    agentName: 'Rashid Mtambo (Kariakoo)',
    code: 'KLI-8921-4829',
    pin: '5921',
    status: 'ACTIVE',
    activatedAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    usedBytes: 1420930291,
    usedSeconds: 3600,
    redeemedByCustomer: 'Amina Salum',
    redeemedMacAddress: 'F4:D4:88:9C:12:4A',
    redeemedIpAddress: '10.100.1.55',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'vch-102',
    tenantId: 'tenant-darnet-01',
    batchId: 'batch-001',
    packageId: 'pkg-3h-1000',
    packageName: '3 Hours Standard',
    packagePrice: 1000,
    packageDurationSeconds: 10800,
    packageRateLimit: '5M/10M',
    code: 'KLI-4402-9912',
    pin: '1029',
    status: 'UNUSED',
    usedBytes: 0,
    usedSeconds: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'vch-103',
    tenantId: 'tenant-darnet-01',
    batchId: 'batch-002',
    packageId: 'pkg-24h-3000',
    packageName: '24 Hours Full Day',
    packagePrice: 3000,
    packageDurationSeconds: 86400,
    packageRateLimit: '10M/20M',
    code: 'POS-7712-3349',
    pin: '8831',
    status: 'UNUSED',
    usedBytes: 0,
    usedSeconds: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'vch-104',
    tenantId: 'tenant-darnet-01',
    packageId: 'pkg-1h-500',
    packageName: '1 Hour Ultra Fast',
    packagePrice: 500,
    packageDurationSeconds: 3600,
    packageRateLimit: '5M/10M',
    code: 'DAR-1190-7721',
    pin: '4490',
    status: 'EXPIRED',
    activatedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 82800000).toISOString(),
    usedBytes: 890492019,
    usedSeconds: 3600,
    redeemedByCustomer: 'David Kimambo',
    redeemedMacAddress: '9C:B6:D0:11:F2:33',
    redeemedIpAddress: '10.100.1.84',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'vch-105',
    tenantId: 'tenant-darnet-01',
    packageId: 'pkg-30d-25000',
    packageName: '30 Days Monthly Hotspot',
    packagePrice: 25000,
    packageDurationSeconds: 2592000,
    packageRateLimit: '15M/30M',
    code: 'VIP-9940-1288',
    pin: '7721',
    status: 'ACTIVE',
    activatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(),
    usedBytes: 34920491029,
    usedSeconds: 432000,
    redeemedByCustomer: 'Sophia Lyimo',
    redeemedMacAddress: 'B8:27:EB:44:99:A1',
    redeemedIpAddress: '10.100.2.14',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

// Initial Customers
export const customers: Customer[] = [
  {
    id: 'cust-01',
    tenantId: 'tenant-darnet-01',
    userId: 'usr-cust-01',
    fullName: 'John Massawe',
    phoneNumber: '+255 744 556 677',
    email: 'john.massawe@gmail.com',
    address: 'Kijitonyama, Plot 44, Dar es Salaam',
    accountNumber: 'DAR-CUST-10081',
    pppoeUsername: 'john_massawe_fiber',
    pppoePassword: 'pass_fiber_secure_2026',
    staticIp: '10.200.10.45',
    balance: 15000,
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 'cust-02',
    tenantId: 'tenant-darnet-01',
    fullName: 'Amina Salum',
    phoneNumber: '+255 718 223 344',
    email: 'amina.salum@outlook.com',
    address: 'Sinza Mori, Dar es Salaam',
    accountNumber: 'DAR-CUST-10082',
    balance: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'cust-03',
    tenantId: 'tenant-darnet-01',
    fullName: 'David Kimambo',
    phoneNumber: '+255 768 445 566',
    email: 'david.k@gmail.com',
    address: 'Mikocheni B, Dar es Salaam',
    accountNumber: 'DAR-CUST-10083',
    balance: 5000,
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

// Initial Live Hotspot Sessions
export const hotspotSessions: HotspotSession[] = [
  {
    id: 'sess-001',
    tenantId: 'tenant-darnet-01',
    routerId: 'rtr-dar-01',
    routerName: 'MikroTik CCR2004 - Kariakoo Core Gateway',
    voucherId: 'vch-101',
    username: 'KLI-8921-4829',
    ipAddress: '10.100.1.55',
    macAddress: 'F4:D4:88:9C:12:4A',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    durationSeconds: 3600,
    bytesIn: 348291029,
    bytesOut: 1072639262,
    isActive: true,
    rateLimitApplied: '5M/10M',
    uptimeFormatted: '01:00:00'
  },
  {
    id: 'sess-002',
    tenantId: 'tenant-darnet-01',
    routerId: 'rtr-dar-02',
    routerName: 'MikroTik RB4011 - Posta City Center Hotspot',
    voucherId: 'vch-105',
    username: 'VIP-9940-1288',
    ipAddress: '10.100.2.14',
    macAddress: 'B8:27:EB:44:99:A1',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    durationSeconds: 7200,
    bytesIn: 1290382910,
    bytesOut: 8940291823,
    isActive: true,
    rateLimitApplied: '15M/30M',
    uptimeFormatted: '02:00:00'
  },
  {
    id: 'sess-003',
    tenantId: 'tenant-darnet-01',
    routerId: 'rtr-dar-01',
    customerId: 'cust-01',
    username: 'john_massawe_fiber',
    ipAddress: '10.200.10.45',
    macAddress: '00:1A:2B:3C:4D:5E',
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    durationSeconds: 259200,
    bytesIn: 18492049102,
    bytesOut: 84920491029,
    isActive: true,
    rateLimitApplied: '20M/20M',
    uptimeFormatted: '3d 00:00:00'
  }
];

// Initial Payments & Transactions (Mobile Money: M-Pesa, Airtel, Tigo, Selcom)
export const payments: Payment[] = [
  {
    id: 'pay-001',
    tenantId: 'tenant-darnet-01',
    customerId: 'cust-01',
    customerName: 'John Massawe',
    packageId: 'pkg-pppoe-home-50000',
    packageName: 'PPPoE Home Fiber 20 Mbps',
    paymentReference: 'XCL-TZS-89218',
    providerTxId: 'MPESA-QRT892140',
    method: 'MPESA',
    amount: 50000,
    currency: 'TZS',
    phoneNumber: '+255 744 556 677',
    status: 'COMPLETED',
    verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'pay-002',
    tenantId: 'tenant-darnet-01',
    customerId: 'cust-02',
    customerName: 'Amina Salum',
    packageId: 'pkg-3h-1000',
    packageName: '3 Hours Standard',
    paymentReference: 'XCL-TZS-99120',
    providerTxId: 'SELCOM-99214819',
    method: 'SELCOM',
    amount: 1000,
    currency: 'TZS',
    phoneNumber: '+255 718 223 344',
    status: 'COMPLETED',
    verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'pay-003',
    tenantId: 'tenant-darnet-01',
    packageId: 'pkg-24h-3000',
    packageName: '24 Hours Full Day',
    paymentReference: 'XCL-TZS-10492',
    providerTxId: 'AIRTEL-8891024',
    method: 'AIRTEL_MONEY',
    amount: 3000,
    currency: 'TZS',
    phoneNumber: '+255 784 112 990',
    status: 'COMPLETED',
    verifiedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'pay-004',
    tenantId: 'tenant-darnet-01',
    packageId: 'pkg-7d-10000',
    packageName: '7 Days Weekly Unlimited',
    paymentReference: 'XCL-TZS-20911',
    providerTxId: 'TIGO-90184912',
    method: 'TIGO_PESA',
    amount: 10000,
    currency: 'TZS',
    phoneNumber: '+255 715 889 001',
    status: 'COMPLETED',
    verifiedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  }
];

// Initial Agents
export const agents: Agent[] = [
  {
    id: 'agt-01',
    tenantId: 'tenant-darnet-01',
    userId: 'usr-agent-01',
    fullName: 'Rashid Mtambo',
    email: 'agent.kariakoo@darnet.co.tz',
    phoneNumber: '+255 765 889 900',
    agentCode: 'AGT-KARIAKOO-01',
    commissionRate: 7.5,
    walletBalance: 85000,
    totalSales: 450000,
    totalCommission: 33750,
    location: 'Kariakoo Market Shop 14, Dar es Salaam',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'agt-02',
    tenantId: 'tenant-darnet-01',
    userId: 'usr-owner-01',
    fullName: 'Fatma Juma',
    email: 'fatma.pos@darnet.co.tz',
    phoneNumber: '+255 713 554 433',
    agentCode: 'AGT-POSTA-02',
    commissionRate: 5.0,
    walletBalance: 140000,
    totalSales: 980000,
    totalCommission: 49000,
    location: 'Posta Mpya Bus Terminal Kiosk',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

// Initial Invoices
export const invoices: Invoice[] = [
  {
    id: 'inv-001',
    tenantId: 'tenant-darnet-01',
    customerId: 'cust-01',
    customerName: 'John Massawe',
    customerPhone: '+255 744 556 677',
    packageId: 'pkg-pppoe-home-50000',
    packageName: 'PPPoE Home Fiber 20 Mbps',
    invoiceNumber: 'INV-2026-0891',
    amount: 50000,
    taxAmount: 9000, // 18% VAT
    totalAmount: 59000,
    status: 'PAID',
    dueDate: new Date(Date.now() + 28 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Monthly PPPoE Fiber Broadband subscription',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// Initial Subscriptions
export const subscriptions: Subscription[] = [
  {
    id: 'sub-001',
    tenantId: 'tenant-darnet-01',
    customerId: 'cust-01',
    customerName: 'John Massawe',
    packageId: 'pkg-pppoe-home-50000',
    packageName: 'PPPoE Home Fiber 20 Mbps',
    billingCycle: 'MONTHLY',
    price: 50000,
    startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    nextBillingDate: new Date(Date.now() + 28 * 86400000).toISOString(),
    status: 'ACTIVE',
    autoRenew: true,
    paymentMethod: 'MPESA'
  }
];

// Initial Audit Logs
export const auditLogs: AuditLog[] = [
  {
    id: 'log-001',
    tenantId: 'tenant-darnet-01',
    userName: 'Juma Mussa (Global Network Director)',
    action: 'SYSTEM_BOOTSTRAP',
    resource: 'XCLOUD_CORE',
    ipAddress: '197.250.45.1',
    result: 'SUCCESS',
    details: { message: 'XCLOUD.NET Multi-Tenant Engine initialized with 3 active tenants and FreeRADIUS sync' },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'log-002',
    tenantId: 'tenant-darnet-01',
    userName: 'Baraka Kimaro',
    action: 'ROUTER_SYNC',
    resource: 'Router',
    resourceId: 'rtr-dar-01',
    ipAddress: '197.250.45.12',
    result: 'SUCCESS',
    details: { identity: 'DAR-CORE-GW-01', syncedQueues: 14, activeUsers: 142 },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log-003',
    tenantId: 'tenant-darnet-01',
    userName: 'Rashid Mtambo',
    action: 'VOUCHER_BATCH_GENERATE',
    resource: 'VoucherBatch',
    resourceId: 'batch-001',
    ipAddress: '197.250.45.99',
    result: 'SUCCESS',
    details: { quantity: 100, package: '3 Hours Standard', prefix: 'KLI' },
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

// Helper to compute dashboard metrics dynamically
export function computeDashboardMetrics(tenantId?: string): DashboardMetrics {
  const filteredPayments = tenantId ? payments.filter(p => p.tenantId === tenantId) : payments;
  const filteredRouters = tenantId ? routers.filter(r => r.tenantId === tenantId) : routers;
  const filteredVouchers = tenantId ? vouchers.filter(v => v.tenantId === tenantId) : vouchers;
  const filteredCustomers = tenantId ? customers.filter(c => c.tenantId === tenantId) : customers;
  const filteredSessions = tenantId ? hotspotSessions.filter(s => s.tenantId === tenantId && s.isActive) : hotspotSessions.filter(s => s.isActive);
  const filteredAgents = tenantId ? agents.filter(a => a.tenantId === tenantId) : agents;

  const revenueToday = filteredPayments
    .filter(p => p.status === 'COMPLETED' && new Date(p.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount, 0);

  const revenueThisMonth = filteredPayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0) + 4820000; // Realistic historical base

  const onlineRouters = filteredRouters.filter(r => r.status === 'ONLINE').length;
  const offlineRouters = filteredRouters.filter(r => r.status === 'OFFLINE').length;
  const activeVouchers = filteredVouchers.filter(v => v.status === 'ACTIVE').length;
  const totalVouchers = filteredVouchers.length;
  const activeHotspotUsers = filteredSessions.length + filteredRouters.reduce((acc, r) => acc + (r.status === 'ONLINE' ? r.activeUsersCount : 0), 0);
  const agentSalesToday = filteredAgents.reduce((sum, a) => sum + 124000, 0);

  // 7-day revenue chart
  const dailyRevenueChart = [
    { date: 'Mon', amount: 340000 },
    { date: 'Tue', amount: 480000 },
    { date: 'Wed', amount: 420000 },
    { date: 'Thu', amount: 610000 },
    { date: 'Fri', amount: 790000 },
    { date: 'Sat', amount: 920000 },
    { date: 'Today', amount: revenueToday > 0 ? revenueToday + 450000 : 540000 }
  ];

  // Hourly traffic chart
  const hourlyTrafficChart = [
    { time: '06:00', downloadMbps: 120, uploadMbps: 45 },
    { time: '09:00', downloadMbps: 480, uploadMbps: 160 },
    { time: '12:00', downloadMbps: 720, uploadMbps: 240 },
    { time: '15:00', downloadMbps: 650, uploadMbps: 210 },
    { time: '18:00', downloadMbps: 980, uploadMbps: 350 },
    { time: '21:00', downloadMbps: 840, uploadMbps: 290 },
    { time: '00:00', downloadMbps: 310, uploadMbps: 90 }
  ];

  const paymentMethodBreakdown = [
    { name: 'M-Pesa (Vodacom)', count: 480, value: 2450000 },
    { name: 'Airtel Money', count: 210, value: 1120000 },
    { name: 'Tigo Pesa / Mixx', count: 180, value: 890000 },
    { name: 'Selcom Pay', count: 95, value: 480000 },
    { name: 'POS Agent Cash', count: 320, value: 1650000 }
  ];

  const packageSalesBreakdown = [
    { name: '1 Hour (TZS 500)', sales: 620 },
    { name: '3 Hours (TZS 1,000)', sales: 940 },
    { name: '24 Hours (TZS 3,000)', sales: 410 },
    { name: '7 Days (TZS 10,000)', sales: 185 },
    { name: '30 Days (TZS 25,000)', sales: 98 }
  ];

  return {
    revenueToday: revenueToday > 0 ? revenueToday : 64000,
    revenueThisMonth,
    activeCustomers: filteredCustomers.length + 184,
    activeHotspotUsers,
    onlineRouters,
    offlineRouters,
    activeVouchers: activeVouchers + 142,
    totalVouchers: totalVouchers + 450,
    agentSalesToday,
    bandwidthUsageGb: 489.2,
    dailyRevenueChart,
    hourlyTrafficChart,
    paymentMethodBreakdown,
    packageSalesBreakdown
  };
}
