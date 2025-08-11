import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { createPoll } from '../services/pollService'

export const createPollController = async (req: AuthenticatedRequest, res: Response) => {
    const poll = await createPoll(req.user!.id, req.body)

    req.log?.info(
        {
            event: 'polls.create',
            outcome: 'success',
            targetUserId: req.user!.id,
            pollId: (poll as any)?._id ?? (poll as any)?.id
        },
        'Poll created'
    )
    res.status(201).json({ poll })
}
