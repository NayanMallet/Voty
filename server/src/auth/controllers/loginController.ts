import type { Request, Response } from 'express'
import { loginUser } from '../services/authService'

export const loginController = async (req: Request, res: Response) => {
    const token = await loginUser(req.body) // req.body a déjà été validé par validateBody
    req.log?.info(
        { event: 'auth.login', outcome: 'success', email: req.body.email },
        'User logged in'
    )
    res.json({ token })
}
