# StockSense

StockSense is an intelligent, full-stack Inventory Management & Operations Platform designed for modern warehouses and supply chains.

It provides real-time inventory tracking, transactional stock operations, audit logging, automated stock alerts, operational dashboards, and an AI Inventory Assistant powered by NVIDIA Nemotron through OpenRouter.

---

## Architecture

StockSense follows a decoupled full-stack architecture with clear security boundaries.

```text
┌──────────────────────────────────────┐
│     React + TypeScript + Vite        │
│          Frontend Application        │
└──────────────────┬───────────────────┘
                   │
             REST API + JWT
                   │
                   ▼
┌──────────────────────────────────────┐
│      Express + TypeScript API        │
│          Backend Application          │
└───────────────┬───────────┬──────────┘
                │           │
                ▼           ▼
        ┌────────────┐  ┌────────────────┐
        │   Prisma   │  │   AI Service   │
        │    ORM     │  │   OpenRouter   │
        └──────┬─────┘  └───────┬────────┘
               │                │
               │          NVIDIA Nemotron
               │          + Tool Calling
               │                │
               │                ▼
               │       ┌────────────────┐
               │       │ Backend Tools  │
               │       │ Read-only +    │
               │       │ Zod validated  │
               │       └───────┬────────┘
               │               │
               └───────┬───────┘
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │     Database     │
              └──────────────────┘
```

### Core Architecture Highlights

* **Decoupled Frontend & Backend:** React communicates with the Express API through authenticated REST endpoints.
* **Transactional Inventory:** Receipts, deliveries, transfers, and adjustments execute using Prisma database transactions.
* **Immutable Stock Ledger:** Every stock movement records the previous quantity, change, resulting quantity, operation type, timestamp, and user.
* **AI Tool Sandbox:** The AI model never directly accesses PostgreSQL. Inventory information is retrieved only through allowlisted, validated backend tools.
* **Backend Security:** Authentication, authorization, validation, and database access are enforced on the server.

---

## Features

### Authentication & Security

* JWT-based authentication
* Password hashing with bcrypt
* Role-based access control
* Password recovery flow with OTP
* Protected API routes
* Backend-enforced permissions
* Zod request validation
* Secure server-side AI API integration

### Inventory Management

* Product and SKU management
* Category management
* Warehouse management
* Storage location management
* Real-time inventory quantities
* Reorder level tracking
* Multi-location inventory

### Inventory Operations

#### Goods Receipts

Receive incoming stock from suppliers.

```text
Inventory + Received Quantity
```

#### Deliveries

Process outgoing customer deliveries with stock validation.

```text
Inventory - Delivered Quantity
```

The system prevents deliveries that would result in negative inventory.

#### Internal Transfers

Move inventory between storage locations.

```text
Source Location  - Quantity
Destination      + Quantity
```

Transfers maintain total inventory conservation.

#### Stock Adjustments

Reconcile recorded inventory with physical counts.

```text
Difference = Physical Count - Recorded Quantity
```

The calculated difference is recorded in the stock ledger.

---

## Stock Ledger

StockSense maintains an immutable audit trail of inventory movements.

Each ledger entry records:

* Operation type
* Product
* Warehouse/location
* Previous quantity
* Quantity change
* New quantity
* Reference document
* User
* Timestamp

Example:

```text
RECEIPT       +100
TRANSFER_OUT   -30
DELIVERY       -20
ADJUSTMENT      -3
-------------------
FINAL           47
```

This provides traceability for inventory changes throughout the system.

---

## Automated Alerts

StockSense automatically monitors inventory levels.

### Low Stock

Triggered when:

```text
Current Quantity <= Reorder Level
```

### Out of Stock

Triggered when:

```text
Current Quantity <= 0
```

The system also prevents duplicate active alerts and can resolve alerts when inventory is replenished.

---

## Operational Dashboard

The dashboard provides real-time operational information including:

* Total products
* Low-stock items
* Out-of-stock items
* Pending receipts
* Pending deliveries
* Scheduled transfers
* Inventory movement
* Stock trends
* Warehouse distribution
* Category distribution
* Recent inventory activity

Dashboard information is retrieved from the backend rather than being hardcoded into the frontend.

---

## AI Inventory Assistant

StockSense includes a natural-language AI Inventory Assistant powered by NVIDIA Nemotron through OpenRouter.

The AI is designed to answer questions about the inventory using live database information.

### Example Questions

```text
Which products are low on stock?
```

```text
Why did Steel Rod stock change?
```

```text
How much inventory is available in Zone A?
```

```text
Show me recent movements for Steel Rods.
```

```text
Which products are below their reorder level?
```

### AI Architecture

```text
User
 │
 ▼
React Assistant
 │
 ▼
POST /api/ai/chat
 │
 ▼
Express AI Controller
 │
 ▼
Inventory Agent
 │
 ▼
OpenRouter
 │
 ▼
NVIDIA Nemotron
 │
 ▼
Validated Tool Request
 │
 ▼
Backend Read-only Tool
 │
 ▼
Prisma
 │
 ▼
PostgreSQL
```

The AI model does **not** receive database credentials and does **not** execute arbitrary SQL.

Available read-only tools include:

* `get_product_stock`
* `get_low_stock_products`
* `get_stock_history`
* `get_product_movements`
* `get_warehouse_inventory`
* `get_pending_receipts`
* `get_pending_deliveries`
* `get_transfer_history`
* `get_dashboard_summary`

---

## Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack React Query
* Recharts
* Lucide React

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* Zod
* JWT
* bcryptjs
* Helmet
* CORS

### Database

* PostgreSQL 16
* Docker Compose

### AI

* OpenRouter
* NVIDIA Nemotron 3 Ultra
* Backend tool calling
* Zod-validated tool arguments

---

## Project Structure

```text
StockSense/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── ai/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.ts
│   │
│   ├── test-phase2.ts
│   ├── test-phase3.ts
│   ├── test-phase3-e2e.ts
│   ├── test-phase4.ts
│   ├── test-phase5.ts
│   ├── test-phase6.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/
│   └── architecture.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

Install:

* Node.js 18+
* npm 9+
* Docker Desktop
* Git

PostgreSQL can be run through Docker Compose.

---

### 1. Clone the Repository

```bash
git clone https://github.com/Shreyas-Appagoni/StockSense.git
cd StockSense
```

---

### 2. Configure Environment Variables

The repository contains `.env.example`.

Create your backend environment file:

```bash
cd backend
```

Create:

```text
.env
```

Example configuration:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL="postgresql://stocksense:stocksense@localhost:5432/stocksense"

JWT_SECRET=change-me-in-production

OPENROUTER_API_KEY=your_openrouter_api_key_here

OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b-20260604:free

OPENROUTER_SITE_URL=http://localhost:5000

OPENROUTER_SITE_NAME=StockSense
```

### Security

Never commit:

```text
.env
backend/.env
```

API keys, database credentials, JWT secrets, and other sensitive values must remain server-side.

The repository `.gitignore` excludes `.env` files.

---

### 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

Verify that PostgreSQL is running:

```bash
docker ps
```

The PostgreSQL container should be healthy and expose port `5432`.

---

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Push the schema:

```bash
npm run prisma:push
```

Seed the database:

```bash
npm run prisma:seed
```

---

### 5. Start Backend

From the `backend` directory:

```bash
npm run dev
```

The backend API runs at:

```text
http://localhost:5000
```

---

### 6. Install Frontend Dependencies

Open another terminal.

From the project root:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

---

## Demo Credentials

The seed script creates synthetic demo accounts.

| Role              | Email                    | Password       |
| ----------------- | ------------------------ | -------------- |
| Inventory Manager | `manager@stocksense.com` | `Password123!` |
| Warehouse Staff   | `staff@stocksense.com`   | `Password123!` |

These credentials are intended for local demonstration and testing.

---

## Recommended Demo Walkthrough

### 1. Login

Open:

```text
http://localhost:5173/login
```

Login using the Inventory Manager account.

---

### 2. Dashboard

Review:

* Total products
* Low-stock items
* Out-of-stock items
* Pending receipts
* Pending deliveries
* Inventory distribution
* Stock movement
* Recent activity

---

### 3. Receive Stock

Navigate to:

```text
Receipts
```

Create a receipt for:

```text
Steel Rods
Quantity: 100
Location: Zone A
```

Validate the receipt.

Inventory increases by 100 units.

---

### 4. Transfer Stock

Navigate to:

```text
Transfers
```

Transfer:

```text
30 Steel Rods
Zone A → Zone B
```

Inventory becomes:

```text
Zone A: 70
Zone B: 30
```

---

### 5. Deliver Stock

Navigate to:

```text
Deliveries
```

Create a delivery of:

```text
20 Steel Rods
From: Zone A
```

After validation:

```text
Zone A: 50
Zone B: 30
```

---

### 6. Adjust Inventory

Navigate to:

```text
Adjustments
```

Set the physical count in Zone A to:

```text
47
```

The system records the difference:

```text
Recorded: 50
Physical: 47
Difference: -3
```

Final inventory:

```text
Zone A: 47
Zone B: 30
Total:   77
```

---

### 7. Inspect Stock Ledger

Navigate to:

```text
Stock Ledger
```

The ledger should show the corresponding movements:

```text
RECEIPT       +100
TRANSFER_OUT   -30
TRANSFER_IN    +30
DELIVERY       -20
ADJUSTMENT      -3
```

---

### 8. Check Alerts

Navigate to:

```text
Alerts
```

Inspect low-stock and out-of-stock alerts generated by inventory thresholds.

---

### 9. Test AI Assistant

Navigate to:

```text
AI Assistant
```

Try:

```text
Which products are low on stock?
```

or:

```text
Why did Steel Rod stock change?
```

The AI uses the backend's inventory tools to retrieve the relevant database information.

---

## API Structure

The backend exposes REST endpoints organized by domain:

```text
/api/auth
/api/products
/api/categories
/api/warehouses
/api/locations
/api/inventory
/api/receipts
/api/deliveries
/api/transfers
/api/adjustments
/api/stock-ledger
/api/alerts
/api/dashboard
/api/ai
```

Dashboard endpoints include:

```text
GET /api/dashboard/summary
GET /api/dashboard/activity
GET /api/dashboard/stock-trends
GET /api/dashboard/warehouse-distribution
GET /api/dashboard/category-distribution
```

AI endpoint:

```text
POST /api/ai/chat
```

---

## Testing

Run the tests from the `backend` directory.

### Phase 2

```bash
npm run test:phase2
```

Database schema, authentication, and RBAC tests.

### Phase 3

```bash
npm run test:phase3
```

Inventory transactions, ledger, validation, and business-rule tests.

### Phase 4

```bash
npm run test:phase4
```

Dashboard and operational endpoint tests.

### Phase 5

```bash
npm run test:phase5
```

AI tools, tool allowlisting, validation, and safety tests.

### Phase 6

```bash
npm run test:phase6
```

Final regression and security tests.

### Run Everything

```bash
npm run test:all
```

---

## Production Builds

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

---

## Security Principles

StockSense follows several security boundaries:

1. API keys are stored only on the backend.
2. `.env` files are excluded from version control.
3. Passwords are hashed using bcrypt.
4. JWT authentication protects private API endpoints.
5. RBAC is enforced by the backend.
6. Request payloads are validated using Zod.
7. Prisma is used for database access.
8. AI tools are explicitly allowlisted.
9. AI tools are read-only in the current implementation.
10. The AI model cannot directly access PostgreSQL.
11. The AI model cannot execute arbitrary SQL.
12. Inventory mutations are performed by controlled backend services.

---

## Project Status

StockSense currently includes:

* Full-stack React + Express architecture
* PostgreSQL database
* Prisma ORM
* Authentication
* RBAC
* Product and category management
* Warehouse and location management
* Inventory tracking
* Goods receipts
* Customer deliveries
* Internal transfers
* Stock adjustments
* Immutable stock ledger
* Automated inventory alerts
* Operational dashboard
* AI Inventory Assistant
* AI tool-calling architecture
* Automated test suites
* Docker PostgreSQL setup

---

## License

This project was developed as a hackathon project and is intended for demonstration and evaluation purposes.
