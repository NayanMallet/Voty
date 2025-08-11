import type { Response } from 'express'
import User from '../models/User'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { HttpError } from '../../lib/http_error'

export const getCurrentUserController = async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user!.id).select('-password')
    if (!user) throw new HttpError(404, 'User not found')

    req.log?.info(
        { event: 'auth.me', outcome: 'success', targetUserId: req.user!.id },
        'Fetched current user'
    )
    res.json({ user })
}
