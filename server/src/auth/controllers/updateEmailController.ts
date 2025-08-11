import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { updateEmailSchema } from '../validators/userValidator'
import { updateEmail } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * MAJ de l'email utilisateur
 */
export const updateEmailController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const data = updateEmailSchema.parse(req.body)
        const user = await updateEmail(req.user!.id, data)
        const safeUser = { ...user.toObject(), password: undefined }

        log.info(
            {
                event: 'user.update',
                outcome: 'success',
                targetUserId: req.user!.id,
                changedFields: ['email']
            },
            'User updated (email)'
        )
        res.json({ user: safeUser })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'user.update', outcome: 'validation_error', issues: err.issues },
                'Invalid update email payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'user.update', outcome: 'failure', status: err.status },
                'Update email failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
