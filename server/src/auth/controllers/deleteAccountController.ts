import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { deleteAccountSchema } from '../validators/userValidator'
import { deleteAccount } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Suppression du compte utilisateur
 */
export const deleteAccountController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const data = deleteAccountSchema.parse(req.body)
        await deleteAccount(req.user!.id, data)

        log.info(
            { event: 'user.delete', outcome: 'success', targetUserId: req.user!.id },
            'User account deleted'
        )
        res.json({ message: 'Account deleted successfully' })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'user.delete', outcome: 'validation_error', issues: err.issues },
                'Invalid delete account payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'user.delete', outcome: 'failure', status: err.status },
                'Account deletion failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
