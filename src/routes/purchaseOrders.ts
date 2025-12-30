import { Router } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../lib/errors'
import { poCreateSchema } from '../validators/purchaseOrders'
import { Prisma } from '@prisma/client'

const router = Router()

// GET /api/purchase-orders (include items)
router.get('/', async (_req, res) => {
  const rows = await prisma.purchaseOrder.findMany({
    orderBy: { poDate: 'desc' },
    include: { items: true, supplier: true },
  })
  res.json({ data: rows })
})

// POST /api/purchase-orders (create PO + items)
router.post('/', async (req, res, next) => {
  try {
    const body = poCreateSchema.parse(req.body)
    const created = await prisma.purchaseOrder.create({
      data: {
        poId: body.poId,
        supplierId: body.supplierId,
        poDate: body.poDate ? new Date(body.poDate) : undefined,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : undefined,
        status: (body.status as any) ?? 'DRAFT',
        currency: body.currency ?? 'IDR',
        notes: body.notes,
        items: {
          create: body.items.map((it) => ({
            productId: it.productId,
            qtyOrdered: new Prisma.Decimal(it.qtyOrdered as any),
            unitCost: new Prisma.Decimal(it.unitCost as any),
          })),
        },
      },
      include: { items: true },
    })
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
})

// GET /api/purchase-orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const found = await prisma.purchaseOrder.findUnique({
      where: { poId: req.params.id },
      include: { items: true, supplier: true },
    })
    if (!found) throw new AppError(404, 'NOT_FOUND', 'Purchase order not found')
    res.json({ data: found })
  } catch (err) {
    next(err)
  }
})

export default router

