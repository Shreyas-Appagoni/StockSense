# StockSense System Architecture Documentation

## 1. High-Level Architecture Overview

StockSense is an enterprise-ready inventory management and operations platform designed with a strict decoupled client-server architecture. All business logic, transaction isolation, authorization enforcement, and AI tool execution reside exclusively within the Node.js/Express backend service.

```
┌────────────────────────────────────────────────────────┐
│                   React Client                         │
│   (Vite, TypeScript, Tailwind CSS, TanStack Query)     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST (Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Express.js REST API Server               │
│  - Helmet Security & CORS Policy                      │
│  - Authentication Middleware (JWT verification)        │
│  - Role Authorization (MANAGER vs STAFF)               │
│  - Zod Request DTO Validation                          │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │  Transaction Engine  │    │  AI Assistant Engine │  │
│  │  - Atomic Operations │    │  - OpenRouter Client │  │
│  │  - Ledger Audit Log  │    │  - NVIDIA Nemotron   │  │
│  │  - Real-Time Alerts  │    │  - Allowlisted Tools │  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             │                           │              │
│             └─────────────┬─────────────┘              │
│                           │                            │
│                  Prisma Client ORM                     │
└───────────────────────────┼────────────────────────────┘
                            │ SQL Connection Pool
                            ▼
┌────────────────────────────────────────────────────────┐
│                PostgreSQL 16 Database                  │
│  - 14 Normalized Domain Models                         │
│  - ACID Transactions & Row Integrity                   │
│  - Foreign Key Constraints & Unique Indexes            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Frontend/Backend Separation

The frontend is an entirely independent Single Page Application (SPA) built using React 18, Vite, and TypeScript.

- **Zero Direct Database Access:** The client has no knowledge of database connection strings, credentials, or internal schema migrations.
- **Stateless Communication:** The frontend communicates with the backend exclusively via standard HTTP REST endpoints using JSON payloads.
- **Client State Management:** TanStack React Query manages caching, query invalidation, and automatic background re-fetching upon successful mutations.
- **UI Components:** Built using custom modular components styled with Tailwind CSS, supporting clean responsive layouts, data tables with pagination, and interactive Recharts visualizations.

---

## 3. REST API Architecture

The backend is built with Express and TypeScript, organized into layered architectural components:

- **Routes (`src/routes/`):** Define URI endpoints, associate HTTP methods, and attach middleware chains.
- **Middleware (`src/middleware/`):**
  - `authenticate`: Extracts and verifies JWT bearer tokens, attaching the authenticated user payload to `req.user`.
  - `authorize(roles)`: Enforces role boundaries, rejecting unauthorized users with HTTP `403 Forbidden`.
  - `validate(schema)`: Validates request bodies, query parameters, and URL parameters using Zod schemas before passing execution to controllers.
- **Controllers (`src/controllers/`):** Handle HTTP request/response lifecycles, invoke application services, and format standardized responses.
- **Services (`src/services/`):** Encapsulate business logic, domain algorithms, calculations, and data persistence transactions.

---

## 4. Prisma & PostgreSQL Layer

Data persistence is managed via Prisma ORM interfacing with PostgreSQL 16.

### Domain Models (14 Models):
1. **User:** User credentials, bcrypt password hashes, and assigned system role (`INVENTORY_MANAGER` or `WAREHOUSE_STAFF`).
2. **Category:** Product classification hierarchy.
3. **Product:** SKU, barcode, name, description, unit of measure, reorder level.
4. **Warehouse:** Multi-facility tracking with unique facility codes.
5. **Location:** Zoned storage locations within warehouses (e.g., Bulk Storage, High Density Rack, Staging).
6. **Supplier:** Vendor contact and supply terms.
7. **Inventory:** Real-time stock levels uniquely constrained by `productId` + `locationId`.
8. **Receipt & ReceiptItem:** Inbound supplier purchase orders and received quantities.
9. **Delivery & DeliveryItem:** Outbound customer fulfillment orders and dispatched quantities.
10. **Transfer & TransferItem:** Internal movements between warehouse locations.
11. **Adjustment & AdjustmentItem:** Physical inventory counts and reconciliation records.
12. **StockLedger:** Immutable double-entry audit log of all quantity movements.
13. **StockAlert:** Automated low-stock and out-of-stock notification records.
14. **PasswordResetToken:** Time-limited hashed OTP tokens for password recovery.

---

## 5. Inventory Transaction Engine

The inventory engine (`src/services/inventoryTransactionService.ts`) is designed around strict transactional integrity:

- **Atomic Transactions (`prisma.$transaction`):** Every inventory mutation runs inside an ACID database transaction. If any sub-operation fails (e.g., negative stock constraint violation), the entire transaction rolls back cleanly.
- **No Negative Stock:** Deliveries and transfer dispatch operations verify that available stock in the designated location is greater than or equal to the requested quantity. If insufficient stock is available, a descriptive error is raised and the transaction is aborted.
- **Inventory Conservation:** Transfers decrement the source location and increment the destination location simultaneously, ensuring total product quantity across the enterprise remains conserved.
- **Reconciliation Deltas:** Adjustments record the difference between current recorded inventory and the physical count (`countedQuantity - currentQuantity`).

---

## 6. Immutable Stock Ledger

StockSense implements an audit trail through the `StockLedger` table:

- **Every Movement Logged:** Receipts, deliveries, transfers, and adjustments must append records to the ledger.
- **Audit Columns:**
  - `productId`: Target product identifier.
  - `locationId`: Location where the movement occurred.
  - `operationType`: `RECEIPT`, `DELIVERY`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`.
  - `referenceType` & `referenceId`: Relational link to the originating transaction document.
  - `quantityDelta`: Signed integer representing the quantity added or removed.
  - `beforeQuantity` & `afterQuantity`: Point-in-time snapshot of inventory levels before and after the operation.
  - `userId`: Attribution to the operator who validated the transaction.
  - `createdAt`: Immutable ISO timestamp.

The ledger is read-only after creation; records are never updated or deleted.

---

## 7. Automated Stock Alerts System

The alert service (`src/services/alertService.ts`) automatically evaluates stock levels upon every transaction:

- **Threshold Rules:**
  - `quantity === 0` → Triggers `OUT_OF_STOCK` alert (SEVERITY: `CRITICAL`).
  - `0 < quantity <= product.reorderLevel` → Triggers `LOW_STOCK` alert (SEVERITY: `WARNING`).
  - `quantity > product.reorderLevel` → Automatically marks any existing active alerts for this product/location as `RESOLVED`.
- **Deduplication:** Prevents duplicate active alerts for the same product and location. If an alert is already active, subsequent transactions do not spam redundant notifications.

---

## 8. Authentication & Authorization Boundaries

Security is enforced at the network and API layers:

- **Password Storage:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds.
- **Token Generation:** Upon successful authentication, a signed JWT containing `userId` and `role` is returned. Tokens expire after 24 hours.
- **Role Enforcement:**
  - `INVENTORY_MANAGER`: Granted access to create/update products, create categories, conduct stock adjustments, manage suppliers, and view all operational reports.
  - `WAREHOUSE_STAFF`: Limited to receiving stock, picking/packing deliveries, executing internal transfers, and querying inventory status.
- **Defense in Depth:** Even if a user manipulates client-side code or hides/shows buttons, direct HTTP requests to manager-only endpoints return HTTP `403 Forbidden` from the backend middleware.

---

## 9. AI Assistant Architecture & Tool Sandbox

The AI Inventory Assistant connects natural-language user queries to backend warehouse data:

```
[ User in /assistant ]
         │ "Which products are low on stock?"
         ▼
[ Express POST /api/ai/chat ]
         │ (Requires valid JWT)
         ▼
[ OpenRouter API ]
         │ (NVIDIA Nemotron 3 Ultra)
         ▼
[ LLM Requests Tool Execution: get_low_stock_products() ]
         │
         ▼
[ Backend Security Allowlist & Zod Validator ]
         │ (Blocks any non-allowlisted function or malformed arguments)
         ▼
[ Backend Tool Handler ]
         │ (Executes read-only Prisma query)
         ▼
[ Tool Result returned to LLM ]
         │
         ▼
[ LLM Formulates Natural Language Response ]
         │
         ▼
[ Client renders grounded explanation ]
```

### Critical Security Boundaries:
> **The LLM never directly accesses PostgreSQL. All inventory information is retrieved through allowlisted backend tools.**

- **Strictly Read-Only:** All 9 available AI tools are read-only (`SELECT` queries only). The assistant has zero capability to alter quantities, delete data, or execute mutations.
- **No Arbitrary SQL Execution:** The assistant cannot submit SQL queries, raw Prisma expressions, or model queries.
- **Credential Isolation:** The `OPENROUTER_API_KEY` exists exclusively in the backend runtime environment. It is never transmitted to the frontend or included in build artifacts.
- **Parameter Validation:** All arguments supplied by the LLM are parsed and validated via Zod schemas before tool execution.