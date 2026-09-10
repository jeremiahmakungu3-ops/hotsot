// XCLOUD.NET — Frontend API Client

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
  DashboardMetrics,
  AutoInstallConfig,
  AutoInstallPreset
} from '../types/index.ts';

const BASE_URL = '/api/v1';

export async function fetchTenants(): Promise<Tenant[]> {
  const res = await fetch(`${BASE_URL}/tenants`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchDashboardMetrics(tenantId?: string): Promise<DashboardMetrics> {
  const url = tenantId ? `${BASE_URL}/dashboard/metrics?tenantId=${tenantId}` : `${BASE_URL}/dashboard/metrics`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data;
}

export async function fetchRouters(tenantId?: string): Promise<Router[]> {
  const url = tenantId ? `${BASE_URL}/routers?tenantId=${tenantId}` : `${BASE_URL}/routers`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function createRouter(payload: Partial<Router>): Promise<Router> {
  const res = await fetch(`${BASE_URL}/routers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

export async function updateRouter(routerId: string, payload: Partial<Router>): Promise<Router> {
  const res = await fetch(`${BASE_URL}/routers/${routerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

export async function deleteRouter(routerId: string): Promise<void> {
  await fetch(`${BASE_URL}/routers/${routerId}`, { method: 'DELETE' });
}

export async function syncRouter(routerId: string): Promise<void> {
  await fetch(`${BASE_URL}/routers/${routerId}/sync`, { method: 'POST' });
}

export async function rebootRouter(routerId: string): Promise<void> {
  await fetch(`${BASE_URL}/routers/${routerId}/reboot`, { method: 'POST' });
}

export async function runDiagnostics(routerId: string) {
  const res = await fetch(`${BASE_URL}/routers/${routerId}/diagnostics`, { method: 'POST' });
  const data = await res.json();
  return data.data;
}

export async function fetchAutoInstallPresetConfig(
  preset: AutoInstallPreset,
  routerId?: string
): Promise<AutoInstallConfig> {
  const params = new URLSearchParams({ preset });
  if (routerId) params.append('routerId', routerId);
  const res = await fetch(`${BASE_URL}/routers/autoinstall/preset-config?${params.toString()}`);
  const data = await res.json();
  return data.data;
}

export async function generateAutoInstallScript(config: AutoInstallConfig): Promise<{
  script: string;
  filename: string;
  config: AutoInstallConfig;
  sizeBytes: number;
  features: Record<string, boolean>;
}> {
  const res = await fetch(`${BASE_URL}/routers/autoinstall/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  return data.data;
}

export async function applyAutoInstallConfig(
  routerId: string,
  config: AutoInstallConfig
): Promise<{ router: Router; script: string; filename: string }> {
  const res = await fetch(`${BASE_URL}/routers/${routerId}/autoinstall/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  return data.data;
}

export async function fetchPackages(tenantId?: string): Promise<Package[]> {
  const url = tenantId ? `${BASE_URL}/packages?tenantId=${tenantId}` : `${BASE_URL}/packages`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function createPackage(payload: Partial<Package>): Promise<Package> {
  const res = await fetch(`${BASE_URL}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

export async function deletePackage(id: string): Promise<void> {
  await fetch(`${BASE_URL}/packages/${id}`, { method: 'DELETE' });
}

export async function fetchVouchers(tenantId?: string): Promise<Voucher[]> {
  const url = tenantId ? `${BASE_URL}/vouchers?tenantId=${tenantId}` : `${BASE_URL}/vouchers`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function fetchVoucherBatches(tenantId?: string): Promise<VoucherBatch[]> {
  const url = tenantId ? `${BASE_URL}/vouchers/batches?tenantId=${tenantId}` : `${BASE_URL}/vouchers/batches`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function generateVouchers(payload: {
  packageId: string;
  quantity: number;
  prefix?: string;
  notes?: string;
  tenantId?: string;
}): Promise<{ data: Voucher[]; message: string }> {
  const res = await fetch(`${BASE_URL}/vouchers/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function redeemVoucher(code: string, macAddress?: string): Promise<Voucher> {
  const res = await fetch(`${BASE_URL}/vouchers/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, macAddress })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to redeem voucher');
  }
  return data.data;
}

export async function fetchSessions(tenantId?: string): Promise<HotspotSession[]> {
  const url = tenantId ? `${BASE_URL}/sessions?tenantId=${tenantId}` : `${BASE_URL}/sessions`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function disconnectSession(sessionId: string): Promise<void> {
  await fetch(`${BASE_URL}/sessions/${sessionId}/disconnect`, { method: 'POST' });
}

export async function fetchPayments(tenantId?: string): Promise<Payment[]> {
  const url = tenantId ? `${BASE_URL}/payments?tenantId=${tenantId}` : `${BASE_URL}/payments`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function initiatePayment(payload: {
  tenantId?: string;
  customerName?: string;
  packageId: string;
  phoneNumber: string;
  method: string;
  amount?: number;
}) {
  const res = await fetch(`${BASE_URL}/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function triggerPaymentWebhook(payload: {
  paymentReference: string;
  status: string;
  providerTxId?: string;
}) {
  const res = await fetch(`${BASE_URL}/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function fetchAgents(tenantId?: string): Promise<Agent[]> {
  const url = tenantId ? `${BASE_URL}/agents?tenantId=${tenantId}` : `${BASE_URL}/agents`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function sellVoucherPos(agentId: string, packageId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/sell-voucher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId })
  });
  return await res.json();
}

export async function fetchCustomers(tenantId?: string): Promise<Customer[]> {
  const url = tenantId ? `${BASE_URL}/customers?tenantId=${tenantId}` : `${BASE_URL}/customers`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function createCustomer(payload: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

export async function fetchInvoices(tenantId?: string): Promise<Invoice[]> {
  const url = tenantId ? `${BASE_URL}/invoices?tenantId=${tenantId}` : `${BASE_URL}/invoices`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function fetchSubscriptions(tenantId?: string): Promise<Subscription[]> {
  const url = tenantId ? `${BASE_URL}/subscriptions?tenantId=${tenantId}` : `${BASE_URL}/subscriptions`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function fetchAuditLogs(tenantId?: string): Promise<AuditLog[]> {
  const url = tenantId ? `${BASE_URL}/audit-logs?tenantId=${tenantId}` : `${BASE_URL}/audit-logs`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}
