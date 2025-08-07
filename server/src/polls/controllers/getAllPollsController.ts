import { Request, Response } from 'express'
import { getAllPolls } from '../services/pollService'

/**
 * Controller pour récupérer tous les sondages.
 */
export const getAllPollsController = async (_req: Request, res: Response): Promise<void> => {
    try {
        const polls = await getAllPolls()
        res.json({ polls });
    } catch (error) {
        console.error('[getAllPollsController]', (error as Error).message)
        res.status(500).json({ message: 'Server error' })
    }
}
