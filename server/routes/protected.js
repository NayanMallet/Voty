import express from 'express'
import auth from '../middleware/auth.js'

const router = express.Router()

// Route test protégée
router.get('/profile', auth, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}` })
})

export default router
