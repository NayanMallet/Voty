import { Request, Response, NextFunction } from 'express'
import { getAllPolls } from '../services/pollService'

/**
 * Récupère tous les sondages.
 */
export const getAllPollsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const polls = await getAllPolls()

        log.info(
            { event: 'polls.list', outcome: 'success', count: polls.length },
            'Fetched all polls'
        )
        res.json({ polls })
    } catch (err) {
        return next(err) // errorHandler => 500 + log.error
    }
}
