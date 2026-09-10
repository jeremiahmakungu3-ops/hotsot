# XCLOUD.NET — Commercial Hotspot Billing & ISP Automation Platform

**Hotspot Billing • ISP Automation • MikroTik RouterOS v7 Cloud Management • FreeRADIUS • Mobile Money**

Designed for Tanzania (TZS, M-Pesa, Airtel Money, Tigo Pesa/Mixx, HaloPesa, Selcom) and globally scalable for multi-tenant ISPs, WISPs, hotels, malls, universities, and commercial WiFi networks.

---

## 🚀 Key Architecture & Features

1. **Multi-Tenant Architecture**: Strict data isolation by tenant UUID for multiple ISPs, franchise branches, or hotel chains.
2. **MikroTik RouterOS v7 Automation**:
   - Zero-touch router onboarding with secure, idempotent `.rsc` provisioning script generator.
   - RADIUS client, HotSpot profile, Walled Garden (M-Pesa, Airtel, Tigo, Selcom), and scheduler-driven telemetry heartbeat.
   - Remote live diagnostics, sync, and CoA / Disconnect-Request (RFC 3576).
3. **FreeRADIUS 3.0 Integration**:
   - Centralized authentication authority and RFC 2866 accounting with MikroTik Vendor-Specific Attributes (VSAs: `Mikrotik-Rate-Limit` e.g., `5M/10M`, `20M/20M`).
4. **Mobile Money Payment Engine (Tanzania)**:
   - Built-in integration layer for **Vodacom M-Pesa**, **Airtel Money**, **Tigo Pesa (Mixx)**, **HaloPesa**, and **Selcom Pay**.
   - HMAC SHA-256 webhook signature verification with automatic voucher/session activation upon payment callback.
5. **Voucher & PIN Engine**:
   - Cryptographically secure bulk voucher generation with custom prefixes (e.g. `KLI-XXXX-XXXX`), 4-digit PINs, QR code payloads, and print layouts.
6. **Agent & Fast-POS Terminal**:
   - Cash sales, wallet floats, automated commission calculations, and instant voucher receipt generation for street/kiosk agents.
7. **Captive Portal & Customer Self-Service**:
   - Responsive MikroTik-compatible HotSpot login portal with PIN entry, Mobile Money package purchase, and live session status timer.
   - Customer self-service dashboard for PPPoE/HotSpot subscribers.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion animations.
- **Backend API**: Node.js, Express, TypeScript (`tsx` in dev, `esbuild` in production bundle), WebSockets (`ws`).
- **Database & Cache**: PostgreSQL 16 with Prisma ORM, Redis 7 with BullMQ.
- **RADIUS Server**: FreeRADIUS 3.0 with MikroTik dictionary.
- **Reverse Proxy**: Nginx with HTTP/2, SSL termination, and WebSocket streaming.

---

## 📦 Production Docker Deployment

### 1. Prerequisites
- Linux Server (Ubuntu 22.04 / Debian 12 / RHEL 9)
- Docker 24+ and Docker Compose v2+
- Ports open on firewall: `80`, `443` (HTTP/HTTPS), `1812/udp`, `1813/udp`, `3799/udp` (RADIUS & CoA).

### 2. Quickstart Launch

```bash
# Clone the repository
git clone https://github.com/xcloud-net/xcloud-platform.git
cd xcloud-platform

# Setup environment variables
cp .env.example .env
nano .env

# Build and start all multi-container services
docker-compose up -d --build

# View real-time container logs
docker-compose logs -f app
```

---

## 📡 MikroTik RouterOS v7 Onboarding Guide

1. Navigate to **Routers** in the XCLOUD.NET Admin Dashboard.
2. Click **Add Router**, fill in Router Name, Identity (e.g., `DAR-CORE-GW-01`), and Public/Local IP.
3. Click **Generate & Copy Provisioning Script**.
4. Open your MikroTik router in **Winbox** or **SSH Terminal** and paste the script:
   ```routeros
   # The script automatically creates pre-install backups, configures FreeRADIUS,
   # sets up Walled Garden for Mobile Money, and establishes the telemetry scheduler.
   ```
5. Within 30 seconds, the router status badge turns **ONLINE** with real-time CPU, RAM, and active user telemetry!

---

## 💳 Mobile Money Webhook Configuration

Set your payment provider callback endpoint to:
```
POST https://your-domain.com/api/v1/payments/webhook
```
Payload Format (JSON):
```json
{
  "paymentReference": "XCL-TZS-89218",
  "providerTxId": "MPESA-QRT892140",
  "status": "COMPLETED",
  "amount": 1000,
  "currency": "TZS"
}
```

---

## 🔒 Security & RBAC Policies
- Passwords hashed using Argon2id / secure salt hashing.
- Encrypted router credentials at rest.
- Granular RBAC roles: `SUPER_ADMIN`, `ISP_OWNER`, `NETWORK_ENGINEER`, `BILLING_MANAGER`, `AGENT`, `CUSTOMER`.
- Full audit logs tracking user operations, remote router executions, and voucher redemptions.

© 2026 XCLOUD.NET — All Rights Reserved.
