import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { updatePasswordSchema } from '../validators/userValidator'
import { updatePassword } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * MAJ du mot de passe utilisateur
 */
export const updatePasswordController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const data = updatePasswordSchema.parse(req.body)
        await updatePassword(req.user!.id, data)

        log.info(
            { event: 'user.update_password', outcome: 'success', targetUserId: req.user!.id },
            'User password updated'
        )
        res.json({ message: 'Password updated successfully' })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'user.update_password', outcome: 'validation_error', issues: err.issues },
                'Invalid update password payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'user.update_password', outcome: 'failure', status: err.status },
                'Password update failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
