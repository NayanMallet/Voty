import { Router } from 'express';
import auth, { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /protected/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile info with user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome user 64b1234abc...
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/profile', auth, (req: AuthenticatedRequest, res) => {
    res.json({ message: `Welcome user ${req.user?.id}` });
});

export default router;
