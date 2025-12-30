import { Router } from 'express'
import productsRouter from './products'
import warehousesRouter from './warehouses'
import suppliersRouter from './suppliers'
import purchaseOrdersRouter from './purchaseOrders'
import inventoryTransactionsRouter from './inventoryTransactions'
import dashboardRouter from './dashboard'

const router = Router()

router.use('/products', productsRouter)
router.use('/warehouses', warehousesRouter)
router.use('/suppliers', suppliersRouter)
router.use('/purchase-orders', purchaseOrdersRouter)
router.use('/inventory', inventoryTransactionsRouter)
router.use('/dashboard', dashboardRouter)

router.get('/health', (_req, res) => res.json({ ok: true }))

export default router

