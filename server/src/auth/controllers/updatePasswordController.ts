import type { Response } from 'express'
import { updatePassword } from '../services/userService'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const updatePasswordController = async (req: AuthenticatedRequest, res: Response) => {
    await updatePassword(req.user!.id, req.body)

    req.log?.info(
        { event: 'user.update_password', outcome: 'success', targetUserId: req.user!.id },
        'User password updated'
    )
    res.json({ message: 'Password updated successfully' })
}
