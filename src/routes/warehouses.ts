import { Router } from 'express'
import prisma from '../lib/prisma'
import { warehouseCreateSchema } from '../validators/warehouses'
import { AppError } from '../lib/errors'

const router = Router()

router.get('/', async (_req, res) => {
  const rows = await prisma.warehouse.findMany({ orderBy: { createdAt: 'desc' } })
  res.json({ data: rows })
})

router.post('/', async (req, res, next) => {
  try {
    const body = warehouseCreateSchema.parse(req.body)
    const created = await prisma.warehouse.create({ data: body })
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const found = await prisma.warehouse.findUnique({ where: { warehouseId: req.params.id } })
    if (!found) throw new AppError(404, 'NOT_FOUND', 'Warehouse not found')
    res.json({ data: found })
  } catch (err) {
    next(err)
  }
})

export default router

