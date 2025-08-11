import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { loginSchema } from '../validators/authValidator'
import { loginUser } from '../services/authService'

/**
 * Controller pour la connexion d'un utilisateur.
 */
export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const log = req.log || console
    try {
        const validated = loginSchema.parse(req.body)
        const token = await loginUser(validated)

        log.info(
            {
                event: 'auth.login',
                outcome: 'success',
                email: validated.email
            },
            'User logged in'
        )
        res.json({ token })
    } catch (err: any) {
        if (err instanceof ZodError) {
            log.warn(
                {
                    event: 'auth.login',
                    outcome: 'validation_error',
                    issues: err.issues
                },
                'Invalid login payload'
            )
            res.status(400).json({ message: 'Invalid payload' })
            return
        }

        if (typeof err?.status === 'number' && err.status < 500) {
            // ex: invalid credentials => 400/401
            log.warn(
                { event: 'auth.login', outcome: 'failure', status: err.status },
                'Login failed'
            )
            res.status(err.status).json({ message: err.message || 'Error' })
            return
        }
        return next(err)
    }
}
