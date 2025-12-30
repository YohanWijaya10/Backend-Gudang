import { z } from 'zod'

export const poItemSchema = z.object({
  productId: z.string().min(1),
  qtyOrdered: z.preprocess((v) => (typeof v === 'string' ? v : v), z.union([z.string(), z.number()])),
  unitCost: z.preprocess((v) => (typeof v === 'string' ? v : v), z.union([z.string(), z.number()])),
})

export const poCreateSchema = z.object({
  poId: z.string().min(1),
  supplierId: z.string().min(1),
  poDate: z.string().datetime().optional(),
  expectedDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CLOSED', 'CANCELED']).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(poItemSchema).min(1),
})

