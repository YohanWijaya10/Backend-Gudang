# Pabrik Backend (MVP - Phase 1 Core)

Node.js + Express + TypeScript + Prisma (Neon Postgres) backend. JSON-only REST API for products, warehouses, suppliers, purchase orders, inventory transactions, and dashboard queries.

## Requirements
- Node.js 18+
- Postgres database (Neon recommended)
- `DATABASE_URL` in environment

## Setup
1. Copy env and configure:
   
   ```bash
   cp .env.example .env
   # edit DATABASE_URL, PORT, CORS_ORIGIN
   ```

2. Install dependencies:
   
   ```bash
   npm install
   ```

3. Generate Prisma client and migrate schema into Postgres schema `factory`:
   
   ```bash
   npm run db:generate
   npm run db:migrate -- --name init
   ```

4. Seed sample data (idempotent):
   
   ```bash
   npm run db:seed
   ```

5. Run dev server:
   
   ```bash
   npm run dev
   ```

Server listens on `PORT` (default 3000). All endpoints are under `/api` and return JSON only.

## Key Endpoints

- Products
  - `GET /api/products?includeInactive=true`
  - `POST /api/products`
  - `GET /api/products/:id`
  - `PATCH /api/products/:id`
  - `DELETE /api/products/:id` (soft delete: `isActive=false`)

- Warehouses
  - `GET /api/warehouses`
  - `POST /api/warehouses`

- Suppliers
  - `GET /api/suppliers`
  - `POST /api/suppliers`

- Purchase Orders
  - `GET /api/purchase-orders` (includes items)
  - `POST /api/purchase-orders` (create header + items)
  - `GET /api/purchase-orders/:id` (includes supplier + items)

- Inventory
  - `POST /api/inventory/transactions` (updates `inventory_balances` atomically)

- Dashboard
  - `GET /api/dashboard/stock-critical`
  - `GET /api/dashboard/overstock`
  - `GET /api/dashboard/slow-moving`

## Curl Examples

1) Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"productId":"P100","name":"Sample","sku":"SMP-100"}'
```

2) Create Inventory Transaction (RECEIPT)
```bash
curl -X POST http://localhost:3000/api/inventory/transactions \
  -H 'Content-Type: application/json' \
  -d '{"warehouseId":"W001","productId":"P001","trxType":"RECEIPT","qty":"10"}'
```

3) Create Purchase Order
```bash
curl -X POST http://localhost:3000/api/purchase-orders \
  -H 'Content-Type: application/json' \
  -d '{
    "poId":"PO-TEST-0001",
    "supplierId":"S001",
    "items":[{"productId":"P001","qtyOrdered":"5","unitCost":"10000"}]
  }'
```

## Notes
- CORS is enabled. Configure allowed origins via `CORS_ORIGIN` (comma-separated or `*`).
- Basic security via `helmet` and request rate limiting.
- Error format: `{ error: { code, message, details? } }`.
- Prisma models use Postgres schema `factory`.

