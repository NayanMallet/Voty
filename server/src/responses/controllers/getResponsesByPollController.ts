import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { getResponsesByPoll } from '../services/responseService'

export const getResponsesByPollController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const pollId = req.params.id
    const responses = await getResponsesByPoll(userId, pollId)

    req.log?.info(
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
}
