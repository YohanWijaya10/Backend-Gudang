export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'STOCK_NEGATIVE'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  status: number
  code: ErrorCode
  details?: any

  constructor(status: number, code: ErrorCode, message: string, details?: any) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function errorResponse(err: AppError | Error) {
  if (err instanceof AppError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? undefined,
      },
    }
  }
  return {
    error: { code: 'INTERNAL_ERROR', message: err.message || 'Unknown error' },
  }
}

