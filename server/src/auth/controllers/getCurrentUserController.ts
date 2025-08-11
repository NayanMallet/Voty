import { Response, NextFunction } from 'express'
import User from '../models/User'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Récupérer l'utilisateur courant à partir du token JWT
 */
export const getCurrentUserController = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
): Promise<void> => {
    const log = req.log || console
    if (!req.user?.id) {
        log.warn(
            { event: 'auth.me', outcome: 'unauthorized' },
            'Unauthorized access'
        )
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
        log.warn(
            { event: 'auth.me', outcome: 'not_found', targetUserId: req.user.id },
            'User not found'
        )
        res.status(404).json({ message: 'User not found' })
        return
    }

    log.info(
        { event: 'auth.me', outcome: 'success', targetUserId: req.user.id },
        'Fetched current user'
    )
    res.json({ user })
}
