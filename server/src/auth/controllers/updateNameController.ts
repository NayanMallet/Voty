import { Response } from 'express'
import { updateNameSchema } from '../validators/userValidator'
import { updateName } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour mettre à jour le nom de l'utilisateur.
 * @param req - Requête HTTP authentifiée
 * @param res - Réponse HTTP
 */
export const updateNameController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = updateNameSchema.parse(req.body)
        const user = await updateName(req.user!.id, data)
        res.json(user)
    } catch (error) {
        console.error('[updateNameController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
