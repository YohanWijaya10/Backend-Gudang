import prisma from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { AppError } from '../lib/errors'

export type RecordInventoryTrxDTO = {
  warehouseId: string
  productId: string
  trxType: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT'
  qty: Prisma.Decimal | number | string
  signedQty?: Prisma.Decimal | number | string
  trxDate?: Date | string
  refType?: string
  refId?: string
  note?: string
}

export async function recordInventoryTransaction(dto: RecordInventoryTrxDTO) {
  const qtyDec = new Prisma.Decimal(dto.qty as any)
  const signed = dto.signedQty !== undefined ? new Prisma.Decimal(dto.signedQty as any) : undefined
  const delta: Prisma.Decimal = signed ??
    (dto.trxType === 'RECEIPT' || dto.trxType === 'TRANSFER_IN' || dto.trxType === 'ADJUSTMENT'
      ? qtyDec
      : qtyDec.mul(-1))

  return await prisma.$transaction(async (tx) => {
    // Create transaction record
    const transaction = await tx.inventoryTransaction.create({
      data: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        trxType: dto.trxType,
        qty: qtyDec,
        signedQty: signed,
        trxDate: dto.trxDate ? new Date(dto.trxDate) : undefined,
        refType: dto.refType,
        refId: dto.refId,
        note: dto.note,
      },
    })

    const key = { warehouseId_productId: { warehouseId: dto.warehouseId, productId: dto.productId } }
    const existing = await tx.inventoryBalance.findUnique({ where: key })

    let balance
    if (!existing) {
      if (delta.lt(0)) {
        throw new AppError(400, 'STOCK_NEGATIVE', 'Inventory would go negative for new balance')
      }
      balance = await tx.inventoryBalance.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          qtyOnHand: delta,
          qtyReserved: new Prisma.Decimal(0),
          safetyStock: new Prisma.Decimal(0),
          reorderPoint: new Prisma.Decimal(0),
        },
      })
    } else {
      const newQty = existing.qtyOnHand.add(delta)
      if (newQty.lt(0)) {
        throw new AppError(400, 'STOCK_NEGATIVE', 'Inventory would go negative')
      }
      balance = await tx.inventoryBalance.update({
        where: key,
        data: {
          qtyOnHand: newQty,
          updatedAt: new Date(),
        },
      })
    }

    return { transaction, balance }
  })
}

