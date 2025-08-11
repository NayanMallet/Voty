import type { Response } from 'express'
import { updateEmail } from '../services/userService'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const updateEmailController = async (req: AuthenticatedRequest, res: Response) => {
    const user = await updateEmail(req.user!.id, req.body)
    const safeUser = { ...user, password: undefined }

    req.log?.info(
        {
            event: 'user.update',
            outcome: 'success',
            targetUserId: req.user!.id,
            changedFields: ['email']
        },
        'User updated (email)'
    )
    res.json({ user: safeUser })
}
