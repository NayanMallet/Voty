import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { updateResponseSchema } from '../validators/responseValidator'
import { updateResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Mettre à jour une réponse
 */
export const updateResponseController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const userId = req.user!.id
    const pollId = req.params.id
    const responseId = req.params.responseId

    try {
        const data = updateResponseSchema.parse(req.body)
        const response = await updateResponse(userId, pollId, responseId, data)

        log.info(
            {
                event: 'responses.update',
                outcome: 'success',
                pollId,
                responseId,
                targetUserId: userId,
                changedFields: Object.keys(data)
            },
            'Response updated'
        )
        res.json({ message: 'Response updated successfully', response })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'responses.update', outcome: 'validation_error', pollId, responseId, issues: err.issues },
                'Invalid update response payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'responses.update', outcome: 'failure', pollId, responseId, status: err.status },
                'Update response failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
