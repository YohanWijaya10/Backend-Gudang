-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "factory";

-- CreateEnum
CREATE TYPE "factory"."InventoryTrxType" AS ENUM ('RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "factory"."POStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CLOSED', 'CANCELED');

-- CreateTable
CREATE TABLE "factory"."Product" (
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'pcs',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "factory"."Warehouse" (
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("warehouseId")
);

-- CreateTable
CREATE TABLE "factory"."Supplier" (
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "termsDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "factory"."InventoryBalance" (
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyOnHand" DECIMAL(18,3) NOT NULL DEFAULT 0.000,
    "qtyReserved" DECIMAL(18,3) NOT NULL DEFAULT 0.000,
    "safetyStock" DECIMAL(18,3) NOT NULL DEFAULT 0.000,
    "reorderPoint" DECIMAL(18,3) NOT NULL DEFAULT 0.000,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryBalance_pkey" PRIMARY KEY ("warehouseId","productId")
);

-- CreateTable
CREATE TABLE "factory"."InventoryTransaction" (
    "trxId" BIGSERIAL NOT NULL,
    "trxDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "trxType" "factory"."InventoryTrxType" NOT NULL,
    "qty" DECIMAL(18,3) NOT NULL,
    "signedQty" DECIMAL(18,3),
    "refType" TEXT,
    "refId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("trxId")
);

-- CreateTable
CREATE TABLE "factory"."PurchaseOrder" (
    "poId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "status" "factory"."POStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("poId")
);

-- CreateTable
CREATE TABLE "factory"."PurchaseOrderItem" (
    "poItemId" BIGSERIAL NOT NULL,
    "poId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyOrdered" DECIMAL(18,3) NOT NULL,
    "unitCost" DECIMAL(18,2) NOT NULL,
    "qtyReceived" DECIMAL(18,3) NOT NULL DEFAULT 0.000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("poItemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "factory"."Product"("sku");

-- CreateIndex
CREATE INDEX "InventoryBalance_productId_idx" ON "factory"."InventoryBalance"("productId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_trxDate_idx" ON "factory"."InventoryTransaction"("trxDate" DESC);

-- CreateIndex
CREATE INDEX "InventoryTransaction_productId_trxDate_idx" ON "factory"."InventoryTransaction"("productId", "trxDate" DESC);

-- CreateIndex
CREATE INDEX "InventoryTransaction_warehouseId_productId_trxDate_idx" ON "factory"."InventoryTransaction"("warehouseId", "productId", "trxDate" DESC);

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_poDate_idx" ON "factory"."PurchaseOrder"("supplierId", "poDate" DESC);

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_poId_idx" ON "factory"."PurchaseOrderItem"("poId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderItem_poId_productId_key" ON "factory"."PurchaseOrderItem"("poId", "productId");

-- AddForeignKey
ALTER TABLE "factory"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "factory"."Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "factory"."Warehouse"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "factory"."Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "factory"."Warehouse"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "factory"."Supplier"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_poId_fkey" FOREIGN KEY ("poId") REFERENCES "factory"."PurchaseOrder"("poId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory"."PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "factory"."Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
