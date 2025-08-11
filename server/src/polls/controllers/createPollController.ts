import { Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { createPollSchema } from '../validators/pollValidator'
import { createPoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour créer un sondage.
 */
export const createPollController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const data = createPollSchema.parse(req.body)
        const poll = await createPoll(req.user!.id, data)

        log.info(
            {
                event: 'polls.create',
                outcome: 'success',
                targetUserId: req.user!.id,
                pollId: (poll as any)?.id ?? (poll as any)?._id
            },
            'Poll created'
        )
        res.status(201).json({ poll })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'polls.create', outcome: 'validation_error', issues: err.issues },
                'Invalid create poll payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'polls.create', outcome: 'failure', status: err.status },
                'Poll creation failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
