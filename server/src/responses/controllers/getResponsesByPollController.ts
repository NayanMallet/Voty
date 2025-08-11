import { Response, NextFunction } from 'express'
import { getResponsesByPoll } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Récupérer toutes les réponses d’un sondage
 */
export const getResponsesByPollController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const userId = req.user!.id
    const pollId = req.params.id

    try {
        const responses = await getResponsesByPoll(userId, pollId)
        log.info(
            {
                event: 'responses.list',
                outcome: 'success',
                pollId,
                targetUserId: userId,
                count: responses.length
            },
            'Fetched responses for poll'
        )
        res.json({ responses })
    } catch (err: any) {
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                {
                    event: 'responses.list',
                    outcome: 'failure',
                    pollId,
                    status: err.status
                },
                'List responses failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
