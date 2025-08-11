import type { Response } from 'express'
import { updateName } from '../services/userService'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const updateNameController = async (req: AuthenticatedRequest, res: Response) => {
    const user = await updateName(req.user!.id, req.body)

    req.log?.info(
        {
            event: 'user.update',
            outcome: 'success',
            targetUserId: req.user!.id,
            changedFields: ['name']
        },
        'User updated (name)'
    )
    res.json({ user })
}
