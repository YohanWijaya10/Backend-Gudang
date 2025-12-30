import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './middleware/errorHandler'
import apiRouter from './routes'

dotenv.config()

const app = express()

// JSON-only API settings
app.set('json replacer', (_key: string, value: any) => (typeof value === 'bigint' ? value.toString() : value))
// Trust proxy for correct client IPs behind Vercel
app.set('trust proxy', true)

// Middlewares
app.use(helmet())
app.use(express.json())
app.use(requestLogger)

const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
  }),
)

// Basic rate limiting (optional)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // On Vercel, req.ip may be undefined; disable strict validations
  validate: false,
})
app.use(limiter)

// Routes (mount at /api because Vercel serves this function under /api)
app.use('/api', apiRouter)

// Debug route for /api
app.get('/api', (_req, res) => {
  res.json({ ok: true, message: 'serverless root reached' })
})

// 404 JSON handler to avoid serverless timeouts on unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` } })
})

// Error handler
app.use(errorHandler)

export default app
