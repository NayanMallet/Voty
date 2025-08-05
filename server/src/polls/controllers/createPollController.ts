import { Response } from 'express'
import { createPollSchema } from '../validators/pollValidator'
import { createPoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour créer un sondage.
 */
export const createPollController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = createPollSchema.parse(req.body)
        const poll = await createPoll(req.user!.id, data)
        res.status(201).json(poll)
    } catch (error) {
        console.error('[createPollController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
