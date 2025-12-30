import { z } from 'zod'

export const inventoryTrxSchema = z.object({
  warehouseId: z.string().min(1),
  productId: z.string().min(1),
  trxType: z.enum(['RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT']),
  qty: z.preprocess((v) => (typeof v === 'string' ? v : v), z.union([z.string(), z.number()])),
  signedQty: z
    .preprocess((v) => (v === undefined || v === null ? undefined : typeof v === 'string' ? v : v), z.union([z.string(), z.number()]).optional()),
  trxDate: z.string().datetime().optional(),
  refType: z.string().optional(),
  refId: z.string().optional(),
  note: z.string().optional(),
})

export type InventoryTrxInput = z.infer<typeof inventoryTrxSchema>

