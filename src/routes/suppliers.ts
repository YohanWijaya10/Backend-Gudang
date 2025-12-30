import { Router } from 'express'
import prisma from '../lib/prisma'
import { supplierCreateSchema } from '../validators/suppliers'
import { AppError } from '../lib/errors'

const router = Router()

router.get('/', async (_req, res) => {
  const rows = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } })
  res.json({ data: rows })
})

router.post('/', async (req, res, next) => {
  try {
    const body = supplierCreateSchema.parse(req.body)
    const created = await prisma.supplier.create({ data: body })
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const found = await prisma.supplier.findUnique({ where: { supplierId: req.params.id } })
    if (!found) throw new AppError(404, 'NOT_FOUND', 'Supplier not found')
    res.json({ data: found })
  } catch (err) {
    next(err)
  }
})

export default router

