import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/dashboard/stock-critical
router.get('/stock-critical', async (_req, res) => {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT ib."warehouseId", ib."productId", ib."qtyOnHand", ib."reorderPoint", ib."safetyStock",
           p."name"
    FROM "factory"."InventoryBalance" ib
    JOIN "factory"."Product" p ON p."productId" = ib."productId"
    WHERE ib."qtyOnHand" <= ib."reorderPoint" OR ib."qtyOnHand" <= ib."safetyStock"
    ORDER BY ib."qtyOnHand" ASC
  `
  res.json({ data: rows })
})

// GET /api/dashboard/overstock
router.get('/overstock', async (_req, res) => {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT ib."warehouseId", ib."productId", ib."qtyOnHand", ib."safetyStock",
           p."name"
    FROM "factory"."InventoryBalance" ib
    JOIN "factory"."Product" p ON p."productId" = ib."productId"
    WHERE ib."qtyOnHand" > (ib."safetyStock" * 3)
    ORDER BY ib."qtyOnHand" DESC
  `
  res.json({ data: rows })
})

// GET /api/dashboard/slow-moving
router.get('/slow-moving', async (_req, res) => {
  const rows = await prisma.$queryRaw<any[]>`
    WITH outgoing AS (
      SELECT it."productId", SUM(it."qty") AS outgoing30d
      FROM "factory"."InventoryTransaction" it
      WHERE it."trxType" IN ('ISSUE','TRANSFER_OUT')
        AND it."trxDate" >= NOW() - INTERVAL '30 days'
      GROUP BY it."productId"
    )
    SELECT ib."productId", p."name", ib."qtyOnHand", COALESCE(o.outgoing30d, 0) AS "outgoing30d"
    FROM "factory"."InventoryBalance" ib
    JOIN "factory"."Product" p ON p."productId" = ib."productId"
    LEFT JOIN outgoing o ON o."productId" = ib."productId"
    WHERE COALESCE(o.outgoing30d, 0) <= 3 AND ib."qtyOnHand" >= 50
    ORDER BY ib."qtyOnHand" DESC
  `
  res.json({ data: rows.map((r) => ({
    productId: r.productId,
    name: r.name,
    qtyOnHand: r.qtyOnHand,
    outgoing30d: r.outgoing30d,
  })) })
})

export default router

