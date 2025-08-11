import type { Request, Response } from 'express'
import { getAllPolls } from '../services/pollService'

export const getAllPollsController = async (req: Request, res: Response) => {
    const polls = await getAllPolls()

    req.log?.info(
        { event: 'polls.list', outcome: 'success', count: polls.length },
        'Fetched all polls'
    )
    res.json({ polls })
}
