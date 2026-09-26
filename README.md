# StockSense

StockSense is an enterprise-grade Intelligent Inventory Management & Operations Platform designed for modern supply chains and warehouses. It provides real-time transactional inventory tracking, automated audit logging via an immutable stock ledger, proactive threshold alerting, live operational dashboards, and an AI Inventory Assistant powered by NVIDIA Nemotron via OpenRouter.

---

## Architecture

StockSense follows a clean, decoupled full-stack architecture with strict security boundaries:

```
[ React + TypeScript + Vite UI ]
              │ (HTTP / REST + Bearer JWT)
              ▼
    [ Express + TypeScript API ]
              │
    ┌─────────┴─────────┐
    │                   │
[ Prisma ORM ]   [ OpenRouter API ]
    │                   │
    │         (NVIDIA Nemotron 3 Ultra)
    │                   │
    │          (Tool Calling)
    │                   │
    │            [ Backend Tools ]
    │                   │ (Prisma Queries)
    └─────────┬─────────┘
              ▼
     [ PostgreSQL Database ]
```

### Core Architecture Highlights
- **Decoupled Frontend & Backend:** Vite-powered React client communicating exclusively via authenticated REST API endpoints.
- **Transactional Consistency:** All inventory mutations (Receipts, Deliveries, Transfers, Adjustments) execute within ACID Prisma transactions.
- **Stock Ledger (Double-Entry Audit Trail):** Every quantity movement logs an immutable ledger entry with previous quantity, delta, new quantity, and user attribution.
- **AI Tool Sandbox:** The LLM never directly accesses PostgreSQL. All inventory data is retrieved through allowlisted, Zod-validated read-only backend tools.

---

## Features

- **Authentication & Security:** JWT-based stateless authentication, bcrypt password hashing, and development password recovery flow.
- **Role-Based Access Control (RBAC):** Strict backend-enforced separation between `INVENTORY_MANAGER` (catalog management, adjustments) and `WAREHOUSE_STAFF` (receipts, picking, transfers).
- **Product & Category Catalog:** SKU management, category organization, reorder thresholds, and unit tracking.
- **Inventory Tracking:** Real-time visibility across warehouses and zoned storage locations.
- **Goods Receipt (Inbound):** Supplier order intake, multi-item validation, and automatic stock incrementation.
- **Delivery Orders (Outbound):** Customer fulfillment with strict stock availability checks preventing negative inventory.
- **Internal Transfers:** Multi-zone stock movement with inventory conservation guarantees and validation preventing same-location transfers.
- **Stock Adjustments:** Physical inventory reconciliation with automatic calculated delta logging.
- **Immutable Stock Ledger:** Complete audit trail tracking operation types, references, locations, and timestamps.
- **Automated Stock Alerts:** Real-time generation of `LOW_STOCK` and `OUT_OF_STOCK` alerts with automatic status resolution when stock is replenished.
- **Operational Dashboard:** Real-time KPI summaries, stock movement trends, warehouse distribution, and category breakdown.
- **AI Inventory Assistant:** Natural-language conversational interface utilizing NVIDIA Nemotron to answer inventory queries grounded in live ledger and product data.

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM (v6)
- **State & Data Fetching:** TanStack React Query (v5)
- **Data Visualization:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript (`tsx` in dev, `tsc` for build)
- **Database ORM:** Prisma ORM (v5)
- **Validation:** Zod schemas for all inbound DTOs and AI tool parameters
- **Security:** Helmet, CORS, JSON Web Tokens (JWT), bcryptjs

### Database
- **Engine:** PostgreSQL 16 (runs via Docker Compose or local instance)

### AI Engine
- **Gateway:** OpenRouter
- **Model:** NVIDIA Nemotron (`nvidia/nemotron-3-ultra-550b-a55b-20260604:free`)
- **Integration:** Allowlisted backend tool calling with strict read-only execution

---

## Setup & Installation

### 1. Prerequisites
- **Node.js:** v18.0.0+ (v20+ recommended)
- **npm:** v9.0.0+
- **Docker Desktop** (optional, recommended for quick PostgreSQL startup) or a local PostgreSQL 16 instance.

### 2. Environment Configuration
Copy the root `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your desired settings:
```env
# Node
NODE_ENV=development

# Backend
PORT=5000
DATABASE_URL="postgresql://stocksense:stocksense@localhost:5432/stocksense"
JWT_SECRET=change-me-in-production

# OpenRouter (NVIDIA Nemotron AI)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b-20260604:free
OPENROUTER_SITE_URL=http://localhost:5000
OPENROUTER_SITE_NAME=StockSense
```
> **Security Note:** Never commit `.env` or real API keys to version control. The repository `.gitignore` automatically excludes all `.env` files.

### 3. Start PostgreSQL Database
Using Docker Compose:
```bash
docker-compose up -d
```
Or start your local PostgreSQL instance on port `5432` with database `stocksense`.

### 4. Backend Setup & Database Migration
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 5. Start Backend Server
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`.

### 6. Frontend Setup & Launch
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start on `http://localhost:5173`.

---

## Demo Credentials & Quick Login

StockSense includes pre-configured synthetic demo accounts seeded with warehouse data:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Inventory Manager** | `manager@stocksense.com` | `Password123!` | Full administrative access, product/category creation, inventory adjustments |
| **Warehouse Staff** | `staff@stocksense.com` | `Password123!` | Standard operations: validate receipts, process deliveries, execute transfers |

The login page includes single-click demo credentials buttons for convenient evaluation.

---

## Recommended Demo Walkthrough

Follow this cohesive end-to-end journey to demonstrate all core capabilities:

1. **Authentication & Quick Login:**
   - Navigate to `http://localhost:5173/login`.
   - Click **Demo Manager** to authenticate as Alice Chen (`INVENTORY_MANAGER`).

2. **Dashboard Overview:**
   - Review live KPIs (Total Products, Low Stock alerts, Pending Receipts, Deliveries).
   - Observe warehouse stock distribution and category breakdown charts.

3. **Inbound Receipt (Stock Arrives):**
   - Navigate to **Receipts** (`/receipts`).
   - Create a receipt or view a draft receipt for *Steel Rods 10mm* (e.g., 100 units to *Zone A - Bulk Storage*).
   - Click **Validate Receipt**. Stock increases immediately.

4. **Internal Transfer (Stock Moves):**
   - Navigate to **Transfers** (`/transfers`).
   - Create and validate a transfer of 30 units of *Steel Rods* from *Zone A* to *Zone B*.
   - Confirm inventory is conserved: Source decrements, Destination increments.

5. **Customer Delivery (Stock Leaves):**
   - Navigate to **Deliveries** (`/deliveries`).
   - Create a delivery of 20 units of *Steel Rods* from *Zone A*.
   - Click **Validate Delivery**. Confirm stock decreases.

6. **Stock Adjustment (Reconciliation):**
   - Navigate to **Adjustments** (`/adjustments`).
   - Conduct a physical count adjustment (e.g. setting physical count to 47 units).
   - Validate adjustment. Calculated variance is recorded.

7. **Stock Ledger Audit Inspection:**
   - Navigate to **Stock Ledger** (`/ledger`).
   - Observe the complete chronological audit trail reflecting:
     - `RECEIPT` (+100)
     - `TRANSFER_OUT` (-30) & `TRANSFER_IN` (+30)
     - `DELIVERY` (-20)
     - `ADJUSTMENT` (delta)
   - Note exact Before/After quantities, timestamps, and user ID attribution.

8. **Stock Alerts:**
   - Navigate to **Alerts** (`/alerts`).
   - Inspect active alerts triggered when stock falls below reorder thresholds.
   - Observe automatic alert resolution upon inventory replenishment.

9. **AI Inventory Assistant (NVIDIA Nemotron):**
   - Navigate to **AI Assistant** (`/assistant`).
   - Ask: *"Which products are low on stock?"* → Assistant invokes `get_low_stock_products` and reports exact items.
   - Ask: *"Why did Steel Rod stock change?"* → Assistant queries `get_product_movements` and provides ledger-grounded explanations.

---

## Verification & Test Commands

Run the comprehensive test suites from the `backend/` directory:

```bash
# Phase 2 — Database Schema, Authentication & RBAC (31 tests)
npm run test:phase2

# Phase 3 — Inventory Engine, Transactions & Ledger (25 tests)
npm run test:phase3

# Phase 4 — Dashboard Analytics & Operational Endpoints (18 tests)
npm run test:phase4

# Phase 5 — AI Assistant Tools, Allowlist & Safety (43 tests)
npm run test:phase5

# Phase 6 — Final Regression & Integration Verification (30 tests)
npm run test:phase6

# Run all test suites
npm run test:all
```

To build production assets:
```bash
# Backend build
cd backend && npm run build

# Frontend build
cd frontend && npm run build
```