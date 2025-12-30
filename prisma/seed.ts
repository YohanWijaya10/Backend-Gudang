import { Prisma, PrismaClient } from '@prisma/client'
import path from 'path'

// Use local prisma client for seed
const prisma = new PrismaClient()

async function main() {
  // Warehouses
  await prisma.warehouse.upsert({
    where: { warehouseId: 'W001' },
    create: { warehouseId: 'W001', name: 'Main Warehouse', location: 'HQ' },
    update: { name: 'Main Warehouse', location: 'HQ', isActive: true },
  })

  // Products
  await prisma.product.upsert({
    where: { productId: 'P001' },
    create: { productId: 'P001', name: 'Widget A', sku: 'WIDGET-A', uom: 'pcs' },
    update: { name: 'Widget A', isActive: true },
  })
  await prisma.product.upsert({
    where: { productId: 'P002' },
    create: { productId: 'P002', name: 'Widget B', sku: 'WIDGET-B', uom: 'pcs' },
    update: { name: 'Widget B', isActive: true },
  })
  await prisma.product.upsert({
    where: { productId: 'P003' },
    create: { productId: 'P003', name: 'Gadget C', sku: 'GADGET-C', uom: 'pcs' },
    update: { name: 'Gadget C', isActive: true },
  })

  // Supplier
  await prisma.supplier.upsert({
    where: { supplierId: 'S001' },
    create: { supplierId: 'S001', name: 'Acme Supplies', phone: '0800000001', termsDays: 30 },
    update: { name: 'Acme Supplies', isActive: true, termsDays: 30 },
  })

  // Purchase Order with items (idempotent)
  await prisma.purchaseOrder.upsert({
    where: { poId: 'PO-2025-0001' },
    create: {
      poId: 'PO-2025-0001',
      supplierId: 'S001',
      currency: 'IDR',
      items: {
        create: [
          { productId: 'P001', qtyOrdered: new Prisma.Decimal(100), unitCost: new Prisma.Decimal(50000) },
          { productId: 'P002', qtyOrdered: new Prisma.Decimal(80), unitCost: new Prisma.Decimal(75000) },
        ],
      },
    },
    update: {
      supplierId: 'S001',
      currency: 'IDR',
      items: {
        deleteMany: {},
        createMany: {
          data: [
            { productId: 'P001', qtyOrdered: new Prisma.Decimal(100), unitCost: new Prisma.Decimal(50000) },
            { productId: 'P002', qtyOrdered: new Prisma.Decimal(80), unitCost: new Prisma.Decimal(75000) },
          ],
          skipDuplicates: true,
        },
      },
    },
  })

  // Remove previous SEED transactions then insert RECEIPT txns and update balances via service
  await prisma.inventoryTransaction.deleteMany({ where: { refType: 'SEED', refId: 'SEED-INIT' } })

  // Lazy import service to avoid circular issues
  const servicePath = path.join(__dirname, '..', 'src', 'services', 'inventoryService.ts')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { recordInventoryTransaction } = require(servicePath) as typeof import('../src/services/inventoryService')

  await recordInventoryTransaction({
    warehouseId: 'W001',
    productId: 'P001',
    trxType: 'RECEIPT',
    qty: new Prisma.Decimal(100),
    refType: 'SEED',
    refId: 'SEED-INIT',
    note: 'Seed initial receipt',
  })

  await recordInventoryTransaction({
    warehouseId: 'W001',
    productId: 'P002',
    trxType: 'RECEIPT',
    qty: new Prisma.Decimal(80),
    refType: 'SEED',
    refId: 'SEED-INIT',
    note: 'Seed initial receipt',
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
