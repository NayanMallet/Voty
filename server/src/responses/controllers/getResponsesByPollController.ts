import { Response } from 'express'
import { getResponsesByPoll } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour récupérer toutes les réponses à un sondage.
 */
export const getResponsesByPollController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const responses = await getResponsesByPoll(req.user!.id, req.params.id)
        res.json({ responses })
    } catch (error) {
        console.error('[getResponsesByPollController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
