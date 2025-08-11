import type { NextFunction, Request, Response } from 'express'
import { isHttpError } from '../lib/http_error'

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
    const log = req.log || console

    const status = isHttpError(err)
        ? err.status
        : typeof err?.status === 'number'
            ? err.status
            : 500

    const level = status >= 500 ? 'error' : 'warn'
    ;(log as any)[level]({ err, status }, 'Unhandled error')

    const message = status === 500 ? 'Internal server error' : err.message || 'Error'
    const body: any = { message }
    if (status === 400 && err?.details) body.details = err.details // expose les erreurs Zod si tu veux
    res.status(status).json(body)
}
