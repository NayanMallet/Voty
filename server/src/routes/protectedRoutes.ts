import { Router } from 'express'
import auth from '../middleware/auth'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/profile', auth, (req: AuthenticatedRequest, res) => {
    res.json({ message: `Welcome user ${req.user?.id}` })
})

export default router
