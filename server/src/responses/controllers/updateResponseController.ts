import { Response } from 'express'
import { updateResponseSchema } from '../validators/responseValidator'
import { updateResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour mettre à jour une réponse.
 */
export const updateResponseController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = updateResponseSchema.parse(req.body)
        const response = await updateResponse(req.user!.id, req.params.id, req.params.responseId, data)
        res.json({ message: 'Response updated successfully', response })
    } catch (error) {
        console.error('[updateResponseController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
