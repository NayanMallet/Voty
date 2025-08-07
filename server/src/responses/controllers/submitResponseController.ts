import { Response } from 'express'
import { submitResponseSchema } from '../validators/responseValidator'
import { submitResponse } from '../services/responseService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour soumettre une réponse à un sondage.
 */
export const submitResponseController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = submitResponseSchema.parse(req.body)
        const response = await submitResponse(req.user!.id, req.params.id, data)
        res.status(201).json({ message: 'Response recorded successfully', response })
    } catch (error) {
        console.error('[submitResponseController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
