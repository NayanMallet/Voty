import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { updatePoll } from '../services/pollService'

export const updatePollController = async (req: AuthenticatedRequest, res: Response) => {
    const pollId = req.params.id
    const poll = await updatePoll(pollId, req.user!.id, req.body)

    req.log?.info(
        {
            event: 'polls.update',
            outcome: 'success',
            pollId,
            targetUserId: req.user!.id,
            changedFields: Object.keys(req.body)
        },
        'Poll updated'
    )
    res.json({ poll })
}
