import { Response } from 'express'
import { deleteAccountSchema } from '../validators/userValidator'
import { deleteAccount } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour supprimer le compte de l'utilisateur.
 * @param req - Requête authentifiée contenant l'ID de l'utilisateur
 * @param res - Réponse à envoyer au client
 */
export const deleteAccountController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = deleteAccountSchema.parse(req.body)
        await deleteAccount(req.user!.id, data)
        res.json({ message: 'Account deleted successfully' })
    } catch (error) {
        console.error('[deleteAccountController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
