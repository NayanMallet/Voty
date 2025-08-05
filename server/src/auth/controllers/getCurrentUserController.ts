import { Response } from 'express'
import User from '../models/User'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour récupérer l'utilisateur courant à partir du token JWT.
 */
export const getCurrentUserController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        res.json(user)
    } catch (err) {
        console.error('[getCurrentUserController]', (err as Error).message)
        res.status(500).json({ message: 'Server error' })
    }
}
