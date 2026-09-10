import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RoutersView } from './components/RoutersView.tsx';
import { RouterOnboarding } from './components/RouterOnboarding.tsx';
import { VouchersView } from './components/VouchersView.tsx';
import { PackagesView } from './components/PackagesView.tsx';
import { SessionsView } from './components/SessionsView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { AgentPosView } from './components/AgentPosView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { InvoicesView } from './components/InvoicesView.tsx';
import { RadiusNetworkView } from './components/RadiusNetworkView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';
import { CaptivePortalView } from './components/CaptivePortalView.tsx';
import { CustomerPortalView } from './components/CustomerPortalView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

import {
  fetchTenants,
  fetchDashboardMetrics,
  fetchRouters,
  fetchPackages,
  fetchVouchers,
  fetchVoucherBatches,
  fetchSessions,
  fetchPayments,
  fetchAgents,
  fetchCustomers,
  fetchInvoices,
  fetchAuditLogs
} from './lib/api.ts';
import {
  Tenant,
  DashboardMetrics,
  Router,
  Package,
  Voucher,
  VoucherBatch,
  HotspotSession,
  Payment,
  Agent,
  Customer,
  Invoice,
  AuditLog
} from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Core entities
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [routers, setRouters] = useState<Router[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [batches, setBatches] = useState<VoucherBatch[]>([]);
  const [sessions, setSessions] = useState<HotspotSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Telemetry & WebSocket
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([
    'FreeRADIUS 3.0 listening on UDP 1812 / 1813',
    'MikroTik REST API & CoA listener active on Port 3799',
    'Vodacom M-Pesa STK push gateway operational'
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async (tenantId?: string) => {
    try {
      const [
        tList,
        mMetrics,
        rRouters,
        pPackages,
        vVouchers,
        bBatches,
        sSessions,
        pPayments,
        aAgents,
        cCustomers,
        iInvoices,
        lAudit
      ] = await Promise.all([
        fetchTenants(),
        fetchDashboardMetrics(tenantId),
        fetchRouters(tenantId),
        fetchPackages(tenantId),
        fetchVouchers(tenantId),
        fetchVoucherBatches(tenantId),
        fetchSessions(tenantId),
        fetchPayments(tenantId),
        fetchAgents(tenantId),
        fetchCustomers(tenantId),
        fetchInvoices(tenantId),
        fetchAuditLogs(tenantId)
      ]);

      setTenants(tList);
      if (!selectedTenant && tList.length > 0) {
        setSelectedTenant(tList[0]);
      }
      setMetrics(mMetrics);
      setRouters(rRouters);
      setPackages(pPackages);
      setVouchers(vVouchers);
      setBatches(bBatches);
      setSessions(sSessions);
      setPayments(pPayments);
      setAgents(aAgents);
      setCustomers(cCustomers);
      setInvoices(iInvoices);
      setAuditLogs(lAudit);
    } catch (err) {
      console.error('Failed to load XCLOUD data:', err);
    }
  }, [selectedTenant]);

  useEffect(() => {
    loadData(selectedTenant?.id);
  }, [selectedTenant, loadData]);

  // Establish WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLiveEvents((prev) => [data, ...prev.slice(0, 30)]);

          if (data.type === 'ALERT' && data.payload?.message) {
            setNotifications((prev) => [data.payload.message, ...prev.slice(0, 15)]);
          } else if (data.type === 'ROUTER_HEARTBEAT') {
            loadData(selectedTenant?.id);
          } else if (data.type === 'VOUCHER_REDEEMED' || data.type === 'POS_SALE') {
            loadData(selectedTenant?.id);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [selectedTenant, loadData]);

  return (
    <div id="xcloud-app" className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        tenants={tenants}
        selectedTenant={selectedTenant}
        onSelectTenant={(t) => {
          setSelectedTenant(t);
          loadData(t.id);
        }}
        wsConnected={wsConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTenant={selectedTenant}
          onOpenQuickVoucher={() => setCurrentTab('vouchers')}
          onOpenAddRouter={() => setCurrentTab('routers')}
          onOpenPos={() => setCurrentTab('agents')}
          notifications={notifications}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              currentTenant={selectedTenant}
              onNavigate={setCurrentTab}
              liveEvents={liveEvents}
            />
          )}

          {currentTab === 'routers' && (
            <RoutersView
              routers={routers}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'onboarding' && (
            <RouterOnboarding
              routers={routers}
              currentTenant={selectedTenant}
              onBack={() => setCurrentTab('routers')}
              onOnboardingComplete={(router) => {
                loadData(selectedTenant?.id);
              }}
            />
          )}

          {currentTab === 'vouchers' && (
            <VouchersView
              vouchers={vouchers}
              batches={batches}
              packages={packages}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'packages' && (
            <PackagesView
              packages={packages}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'sessions' && (
            <SessionsView
              sessions={sessions}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              payments={payments}
              packages={packages}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'agents' && (
            <AgentPosView
              agents={agents}
              packages={packages}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'radius' && (
            <RadiusNetworkView currentTenant={selectedTenant} />
          )}

          {currentTab === 'reports' && (
            <ReportsView metrics={metrics} currentTenant={selectedTenant} />
          )}

          {currentTab === 'audit' && (
            <AuditLogsView
              auditLogs={auditLogs}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'captive-portal' && (
            <CaptivePortalView
              packages={packages}
              currentTenant={selectedTenant}
              onRefresh={() => loadData(selectedTenant?.id)}
            />
          )}

          {currentTab === 'customer-portal' && (
            <CustomerPortalView currentTenant={selectedTenant} />
          )}

          {currentTab === 'settings' && (
            <SettingsView currentTenant={selectedTenant} />
          )}
        </main>
      </div>
    </div>
  );
}
