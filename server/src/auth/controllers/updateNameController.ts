import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { updateNameSchema } from '../validators/userValidator'
import { updateName } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * MAJ du nom de l'utilisateur
 */
export const updateNameController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const data = updateNameSchema.parse(req.body)
        const user = await updateName(req.user!.id, data)
        log.info(
            {
                event: 'user.update',
                outcome: 'success',
                targetUserId: req.user!.id,
                changedFields: Object.keys(data)
            },
            'User updated (name)'
        )
        res.json({ user })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'user.update', outcome: 'validation_error', issues: err.issues },
                'Invalid update name payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'user.update', outcome: 'failure', status: err.status },
                'Update name failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
