import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { deleteResponse } from '../services/responseService'

export const deleteResponseController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const pollId = req.params.id
    const responseId = req.params.responseId

    await deleteResponse(userId, pollId, responseId)
    req.log?.info(
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
}
