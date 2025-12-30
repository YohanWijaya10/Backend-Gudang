import { Router } from 'express'
import { inventoryTrxSchema } from '../validators/inventory'
import { recordInventoryTransaction } from '../services/inventoryService'
import { AppError } from '../lib/errors'
import prisma from '../lib/prisma'
import { Prisma } from '@prisma/client'

const router = Router()

// POST /api/inventory/transactions
router.post('/transactions', async (req, res, next) => {
  try {
    const body = inventoryTrxSchema.parse(req.body)
    // Ensure related entities exist for clearer errors
    const [prod, wh] = await Promise.all([
      prisma.product.findUnique({ where: { productId: body.productId } }),
      prisma.warehouse.findUnique({ where: { warehouseId: body.warehouseId } }),
    ])
    if (!prod) throw new AppError(404, 'NOT_FOUND', 'Product not found')
    if (!wh) throw new AppError(404, 'NOT_FOUND', 'Warehouse not found')

    const result = await recordInventoryTransaction({
      warehouseId: body.warehouseId,
      productId: body.productId,
      trxType: body.trxType,
      qty: new Prisma.Decimal(body.qty as any),
      signedQty: body.signedQty !== undefined ? new Prisma.Decimal(body.signedQty as any) : undefined,
      trxDate: body.trxDate ? new Date(body.trxDate) : undefined,
      refType: body.refType,
      refId: body.refId,
      note: body.note,
    })
    res.status(201).json({ data: result })
  } catch (err) {
    next(err)
  }
})

export default router

