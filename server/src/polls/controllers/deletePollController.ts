import { Response } from 'express'
import { deletePoll } from '../services/pollService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour supprimer un sondage.
 */
export const deletePollController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        await deletePoll(req.params.id, req.user!.id)
        res.json({ message: 'Poll deleted' })
    } catch (error) {
        console.error('[deletePollController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
