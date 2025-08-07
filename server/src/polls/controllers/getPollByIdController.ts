import { Request, Response } from 'express'
import { getPollById } from '../services/pollService'

/**
 * Controller pour récupérer un sondage par ID.
 */
export const getPollByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const poll = await getPollById(req.params.id)

        if (!poll) {
            res.status(404).json({ message: 'Poll not found' })
            return
        }

        res.json({ poll });
    } catch (error) {
        console.error('[getPollByIdController]', (error as Error).message)
        res.status(500).json({ message: 'Server error' })
    }
}
