import { Response, NextFunction } from 'express'
import { deleteResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Supprimer une réponse
 */
export const deleteResponseController = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const userId = req.user!.id
    const pollId = req.params.id
    const responseId = req.params.responseId

    try {
        await deleteResponse(userId, pollId, responseId)
        log.info(
            {
                event: 'responses.delete',
                outcome: 'success',
                pollId,
                responseId,
                targetUserId: userId
            },
            'Response deleted'
        )
        res.json({ message: 'Response deleted successfully' })
    } catch (err: any) {
        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                {
                    event: 'responses.delete',
                    outcome: 'failure',
                    pollId,
                    responseId,
                    status: err.status
                },
                'Delete response failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
