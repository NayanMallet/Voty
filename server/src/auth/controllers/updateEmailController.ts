import { Response } from 'express'
import { updateEmailSchema } from '../validators/userValidator'
import { updateEmail } from '../services/userService'
import { AuthenticatedRequest } from '../../middleware/auth'

/**
 * Controller pour mettre à jour l'email de l'utilisateur.
 * @param req - Requête contenant les données de mise à jour
 * @param res - Réponse à envoyer
 */
export const updateEmailController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = updateEmailSchema.parse(req.body)
        const user = await updateEmail(req.user!.id, data)

        const safeUser = { ...user.toObject(), password: undefined }
        res.json({ user: safeUser })
    } catch (error) {
        console.error('[updateEmailController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
