import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { updatePollSchema } from '../validators/pollValidator'
import { updatePoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Met à jour un sondage.
 */
export const updatePollController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const pollId = req.params.id
    try {
        const data = updatePollSchema.parse(req.body)
        const poll = await updatePoll(pollId, req.user!.id, data)

        log.info(
            {
                event: 'polls.update',
                outcome: 'success',
                pollId,
                targetUserId: req.user!.id,
                changedFields: Object.keys(data)
            },
            'Poll updated'
        )
        res.json({ poll })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                {
                    event: 'polls.update',
                    outcome: 'validation_error',
                    pollId,
                    issues: err.issues
                },
                'Invalid update poll payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                {
                    event: 'polls.update',
                    outcome: 'failure',
                    pollId,
                    status: err.status
                },
                'Poll update failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}