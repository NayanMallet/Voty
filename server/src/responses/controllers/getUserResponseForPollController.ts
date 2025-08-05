import { Response } from 'express'
import { getUserResponseForPoll } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour récupérer la réponse d’un utilisateur à un sondage.
 */
export const getUserResponseForPollController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const response = await getUserResponseForPoll(req.user!.id, req.params.pollId)
        res.json(response || null)
    } catch (error) {
        console.error('[getUserResponseForPollController]', (error as Error).message)
        res.status(500).json({ message: 'Server error' })
    }
}
