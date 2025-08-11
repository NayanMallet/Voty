import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { registerSchema } from '../validators/authValidator'
import { registerUser } from '../services/authService'

/**
 * Controller pour l'enregistrement d'un nouvel utilisateur.
 */
export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const log = req.log || console
    try {
        const validated = registerSchema.parse(req.body)
        const token = await registerUser(validated)

        log.info(
            { event: 'auth.register', outcome: 'success', email: validated.email },
            'User registered'
        )
        return res.status(201).json({ token })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                { event: 'auth.register', outcome: 'validation_error', issues: err.issues },
                'Invalid register payload'
            )
            return res.status(400).json({ message: 'Invalid payload' })
        }

        if (typeof err?.status === 'number' && err.status < 500) {
            log.warn(
                { event: 'auth.register', outcome: 'failure', status: err.status },
                'Registration failed'
            )
            return res.status(err.status).json({ message: err.message || 'Error' })
        }
        return next(err)
    }
}
