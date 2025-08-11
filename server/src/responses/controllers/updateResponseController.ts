import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { updateResponse } from '../services/responseService'

export const updateResponseController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const pollId = req.params.id
    const responseId = req.params.responseId

    const response = await updateResponse(userId, pollId, responseId, req.body)

    req.log?.info(
        {
            event: 'responses.update',
            outcome: 'success',
            pollId,
            responseId,
            targetUserId: userId,
            changedFields: Object.keys(req.body)
        },
        'Response updated'
    )
    res.json({ message: 'Response updated successfully', response })
}
