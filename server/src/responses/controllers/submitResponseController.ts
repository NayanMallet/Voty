import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { submitResponseSchema } from '../validators/responseValidator'
import { submitResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Soumettre une réponse à un sondage
 */
export const submitResponseController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const userId = req.user!.id
    const pollId = req.params.id

    try {
        const data = submitResponseSchema.parse(req.body)
        const response = await submitResponse(userId, pollId, data)

        log.info(
            {
                event: 'responses.submit',
                outcome: 'success',
                pollId,
                targetUserId: userId,
                responseId: (response as any)?._id ?? (response as any)?.id },
            'Response submitted'
        )
        res.status(201).json({ message: 'Response recorded successfully', response })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'responses.submit', outcome: 'validation_error', issues: err.issues, pollId },
                'Invalid submit response payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'responses.submit', outcome: 'failure', pollId, status: err.status },
                'Submit response failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
