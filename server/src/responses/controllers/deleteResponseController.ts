import { Response } from 'express'
import { deleteResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour supprimer une réponse.
 */
export const deleteResponseController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        await deleteResponse(req.user!.id, req.params.id, req.params.responseId)
        res.json({ message: 'Response deleted successfully' })
    } catch (error) {
        console.error('[deleteResponseController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
