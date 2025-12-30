import express from 'express'
import prisma from './lib/prisma'

const app = express()

// JSON-only API settings and proxy trust for Vercel
app.set('json replacer', (_key: string, value: any) => (typeof value === 'bigint' ? value.toString() : value))
app.set('trust proxy', 1)
app.use(express.json())

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`)
  })
  next()
})

// Minimal, stable endpoints mapped for both direct and /api paths
app.get(['/api', '/'], (_req, res) => {
  res.json({ ok: true, message: 'api online' })
})

app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

app.get(['/api/db-health', '/db-health'], async (_req, res) => {
  const t0 = Date.now()
  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 AS "one"')
    const ms = Date.now() - t0
    res.json({ ok: true, ms, result })
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message || 'DB error' })
  }
})

// Catch-all 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

export default app
