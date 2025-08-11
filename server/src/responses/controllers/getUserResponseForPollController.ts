import { Response, NextFunction } from 'express'
import { getUserResponseForPoll } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Récupérer la réponse de l’utilisateur courant pour un sondage
 */
export const getUserResponseForPollController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const userId = req.user!.id
    const pollId = req.params.pollId

    try {
        const response = await getUserResponseForPoll(userId, pollId)
        log.info(
            {
                event: 'responses.get_user',
                outcome: 'success',
                pollId,
                targetUserId: userId,
                found: !!response
            },
            'Fetched user response for poll'
        )
        res.json({ response: response || null })
    } catch (err: any) {
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'responses.get_user', outcome: 'failure', pollId, status: err.status },
                'Get user response failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
