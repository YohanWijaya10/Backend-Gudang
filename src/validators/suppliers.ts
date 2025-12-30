import { z } from 'zod'

export const supplierCreateSchema = z.object({
  supplierId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  termsDays: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
})

