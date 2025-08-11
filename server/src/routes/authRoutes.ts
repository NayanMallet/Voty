import { Router } from 'express'

import auth from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'

import { loginSchema, registerSchema } from '../auth/validators/authValidator'
import { updateNameSchema, updateEmailSchema, updatePasswordSchema, deleteAccountSchema } from '../auth/validators/userValidator'

import { registerController } from "../auth/controllers/registerController";
import { loginController } from "../auth/controllers/loginController";
import { getCurrentUserController } from "../auth/controllers/getCurrentUserController";
import { updateNameController } from "../auth/controllers/updateNameController";
import { updateEmailController } from "../auth/controllers/updateEmailController";
import { updatePasswordController } from "../auth/controllers/updatePasswordController";
import { deleteAccountController } from "../auth/controllers/deleteAccountController";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/register', validateBody(registerSchema), asyncHandler(registerController))

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/login', validateBody(loginSchema), asyncHandler(loginController))

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/me', auth, asyncHandler(getCurrentUserController))

/**
 * @openapi
 * /auth/update-name:
 *   put:
 *     summary: Update user's name
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNameInput'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/update-name', auth, validateBody(updateNameSchema), asyncHandler(updateNameController))

/**
 * @openapi
 * /auth/update-email:
 *   put:
 *     summary: Update user's email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmailInput'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/update-email', auth, validateBody(updateEmailSchema), asyncHandler(updateEmailController))

/**
 * @openapi
 * /auth/update-password:
 *   put:
 *     summary: Update user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordInput'
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/update-password', auth, validateBody(updatePasswordSchema), asyncHandler(updatePasswordController))

/**
 * @openapi
 * /auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAccountInput'
 *     responses:
 *       200:
 *         description: Account deleted
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/delete-account', auth, validateBody(deleteAccountSchema), asyncHandler(deleteAccountController))

export default router;
