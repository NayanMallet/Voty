import { Request, Response } from 'express'
import { registerSchema } from '../validators/authValidator'
import { registerUser } from '../services/authService'

/**
 * Controller pour l'enregistrement d'un nouvel utilisateur.
 * @param req - Requête HTTP
 * @param res - Réponse HTTP
 */
export const registerController = async (req: Request, res: Response) => {
    try {
        const validated = registerSchema.parse(req.body)
        const token = await registerUser(validated)
        return res.status(201).json({ token })
    } catch (err) {
        return res.status(400).json({ message: (err as Error).message })
    }
}
