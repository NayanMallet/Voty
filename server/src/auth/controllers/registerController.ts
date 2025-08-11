import type { Request, Response } from 'express'
import { registerUser } from '../services/authService'

export const registerController = async (req: Request, res: Response) => {
    const token = await registerUser(req.body)
    req.log?.info(
        { event: 'auth.register', outcome: 'success', email: req.body.email },
        'User registered'
    )
    res.status(201).json({ token })
}
