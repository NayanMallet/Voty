import type { NextFunction, Request, Response } from 'express'

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
    const log = req.log || console
    log.error({ err }, 'Unhandled error')

    const status = typeof err?.status === 'number' ? err.status : 500
    const message = status === 500 ? 'Internal server error' : err.message || 'Error'
    res.status(status).json({ message })
}
