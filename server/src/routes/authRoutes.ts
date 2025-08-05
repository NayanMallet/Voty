import { Router } from 'express'

import auth from '../middleware/auth'

import { registerController } from "../auth/controllers/registerController";
import { loginController } from "../auth/controllers/loginController";
import { getCurrentUserController } from "../auth/controllers/getCurrentUserController";
import { updateNameController } from "../auth/controllers/updateNameController";
import { updateEmailController } from "../auth/controllers/updateEmailController";
import { updatePasswordController } from "../auth/controllers/updatePasswordController";
import { deleteAccountController } from "../auth/controllers/deleteAccountController";

const router = Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/me', auth, getCurrentUserController)

router.put('/update-name', auth, updateNameController)
router.put('/update-email', auth, updateEmailController)
router.put('/update-password', auth, updatePasswordController)
router.delete('/delete-account', auth, deleteAccountController)

export default router
