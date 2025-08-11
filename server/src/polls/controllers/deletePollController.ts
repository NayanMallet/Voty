import { Response, NextFunction } from 'express'
import { deletePoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Supprime un sondage.
 */
export const deletePollController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const pollId = req.params.id
    try {
        await deletePoll(pollId, req.user!.id)

        log.info(
            {
                event: 'polls.delete',
                outcome: 'success',
                pollId,
                targetUserId: req.user!.id
            },
            'Poll deleted'
        )
        res.json({ message: 'Poll deleted' })
    } catch (err: any) {
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                {
                    event: 'polls.delete',
                    outcome: 'failure',
                    status: err.status,
                    pollId
                },
                'Poll deletion failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}