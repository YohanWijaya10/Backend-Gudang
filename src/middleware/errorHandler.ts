import { NextFunction, Request, Response } from 'express'
import { AppError, errorResponse } from '../lib/errors'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json(errorResponse(err))
  }

  const status = typeof err?.status === 'number' ? err.status : 500
  const message = err?.message || 'Internal Server Error'
  return res.status(status).json(errorResponse(new AppError(status, 'INTERNAL_ERROR', message)))
}

