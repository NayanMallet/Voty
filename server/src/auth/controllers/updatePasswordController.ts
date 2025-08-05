import { Response } from 'express'
import { updatePasswordSchema } from '../validators/userValidator'
import { updatePassword } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour mettre à jour le mot de passe de l'utilisateur.
 * @param req - Requête authentifiée contenant l'ID de l'utilisateur
 * @param res - Réponse HTTP
 */
export const updatePasswordController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = updatePasswordSchema.parse(req.body)
        await updatePassword(req.user!.id, data)
        res.json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('[updatePasswordController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
