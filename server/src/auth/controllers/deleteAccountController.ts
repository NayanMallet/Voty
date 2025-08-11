import type { Response } from 'express'
import { deleteAccount } from '../services/userService'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const deleteAccountController = async (req: AuthenticatedRequest, res: Response) => {
    await deleteAccount(req.user!.id, req.body)

    req.log?.info(
        { event: 'user.delete', outcome: 'success', targetUserId: req.user!.id },
        'User account deleted'
    )
    res.json({ message: 'Account deleted successfully' })
}
