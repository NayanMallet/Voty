import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { getUserResponseForPoll } from '../services/responseService'

export const getUserResponseForPollController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const pollId = req.params.pollId

    const response = await getUserResponseForPoll(userId, pollId)
    req.log?.info(
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
}
