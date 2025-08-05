import { Request, Response } from 'express'
import { loginSchema } from '../validators/authValidator'
import { loginUser } from '../services/authService'

/**
 * Controller pour la connexion d'un utilisateur.
 * @param req - Requête HTTP
 * @param res - Réponse HTTP
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const validated = loginSchema.parse(req.body)
        const token = await loginUser(validated)
        res.json({ token })
    } catch (error) {
        console.error('[loginController]', (error as Error).message)
        res.status(400).json({ message: (error as Error).message })
    }
}
