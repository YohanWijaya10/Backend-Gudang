import { z } from 'zod'

export const warehouseCreateSchema = z.object({
  warehouseId: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
})

