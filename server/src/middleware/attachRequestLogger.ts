import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './auth'

export const attachRequestLogger = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const base = req.log || console
    // on crée un enfant avec contexte utile
    req.log = base.child?.({
        reqId: (req as any).id,
        userId: req.user?.id ?? null,
    }) ?? base
    next()
}
