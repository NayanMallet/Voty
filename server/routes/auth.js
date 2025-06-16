import express from 'express'
import { register, login, getCurrentUser } from '../controllers/authController.js'
import auth from '../middleware/auth.js'
import {deleteAccount, updateEmail, updateName, updatePassword} from "../controllers/userController.js";

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, getCurrentUser)

router.put('/update-name', auth, updateName)
router.put('/update-email', auth, updateEmail)
router.put('/update-password', auth, updatePassword)
router.delete('/delete-account', auth, deleteAccount)

export default router
