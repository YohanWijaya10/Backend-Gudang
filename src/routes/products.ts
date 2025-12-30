import { Router } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../lib/errors'
import { productCreateSchema, productUpdateSchema } from '../validators/products'

const router = Router()

// GET /api/products
router.get('/', async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true'
  const products = await prisma.product.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ data: products })
})

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const body = productCreateSchema.parse(req.body)
    const created = await prisma.product.create({ data: body })
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const found = await prisma.product.findUnique({ where: { productId: req.params.id } })
    if (!found) throw new AppError(404, 'NOT_FOUND', 'Product not found')
    res.json({ data: found })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/products/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const body = productUpdateSchema.parse(req.body)
    const updated = await prisma.product.update({ where: { productId: req.params.id }, data: body })
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE (soft) /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const updated = await prisma.product.update({ where: { productId: req.params.id }, data: { isActive: false } })
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
})

export default router

