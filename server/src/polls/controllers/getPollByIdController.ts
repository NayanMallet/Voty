import { Request, Response, NextFunction } from 'express'
import { getPollById } from '../services/pollService'

/**
 * Récupère un sondage par ID.
 */
export const getPollByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    const pollId = req.params.id
    try {
        const poll = await getPollById(pollId)

        if (!poll) {
            log.warn(
                { event: 'polls.get', outcome: 'not_found', pollId },
                'Poll not found'
            )
            res.status(404).json({ message: 'Poll not found' })
            return
        }
        log.info(
            { event: 'polls.get', outcome: 'success', pollId },
            'Fetched poll by id'
        )
        res.json({ poll })
    } catch (err) {
        return next(err)
    }
}
