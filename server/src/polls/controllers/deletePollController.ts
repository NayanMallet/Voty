import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { deletePoll } from '../services/pollService'

export const deletePollController = async (req: AuthenticatedRequest, res: Response) => {
    const pollId = req.params.id
    await deletePoll(pollId, req.user!.id)

    req.log?.info(
        {
            event: 'polls.delete',
            outcome: 'success',
            pollId,
            targetUserId: req.user!.id
        },
        'Poll deleted'
    )
    res.json({ message: 'Poll deleted' })
}
