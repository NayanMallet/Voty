import type { Request, Response } from 'express'
import { getPollById } from '../services/pollService'
import { HttpError } from '../../lib/http_error'

export const getPollByIdController = async (req: Request, res: Response) => {
    const pollId = req.params.id
    const poll = await getPollById(pollId)

    if (!poll) throw new HttpError(404, 'Poll not found')

    req.log?.info(
        { event: 'polls.get', outcome: 'success', pollId },
        'Fetched poll by id'
    )
    res.json({ poll })
}
