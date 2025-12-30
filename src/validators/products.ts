import { z } from 'zod'

export const productCreateSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  uom: z.string().default('pcs').optional(),
  isActive: z.boolean().optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

