import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

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
    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload

        if (!decoded.user || !decoded.user.id) {
            console.error('Invalid token structure:', decoded)
            res.status(401).json({ message: 'Invalid token structure' })
            return
        }

        req.user = decoded.user
        next()
    } catch (err) {
        console.error('Token verification error:', (err as Error).message)
        res.status(401).json({ message: 'Token is not valid' })
    }
}

export default auth
