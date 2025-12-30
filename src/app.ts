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
const limiter = rateLimit({ windowMs: 60 * 1000, max: 300 })
app.use(limiter)

// Routes (mount at root; Vercel serves this under /api)
app.use('/', apiRouter)

// Debug root route to verify serverless reachability
app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'serverless root reached' })
})

// Error handler
app.use(errorHandler)

export default app
