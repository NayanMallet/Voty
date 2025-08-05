import { Response } from 'express'
import { updatePollSchema } from '../validators/pollValidator'
import { updatePoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour mettre à jour un sondage.
 */
export const updatePollController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = updatePollSchema.parse(req.body)
        const updated = await updatePoll(req.params.id, req.user!.id, data)
        res.json(updated)
    } catch (error) {
        console.error('[updatePollController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
