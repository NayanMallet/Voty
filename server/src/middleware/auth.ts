import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { HttpError } from '../lib/http_error'

interface JwtPayload {
    user: {
        id: string
    }
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string }
}

const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return next(new HttpError(401, 'No token, authorization denied'))

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined')

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (!decoded.user?.id) return next(new HttpError(401, 'Invalid token structure'))

        req.user = decoded.user
        next()
    } catch (_e) {
        next(new HttpError(401, 'Token is not valid'))
    }
}

export default auth
