import { Router } from 'express'

import auth from '../middleware/auth'

import { submitResponseController } from "../responses/controllers/submitResponseController";
import { getResponsesByPollController } from "../responses/controllers/getResponsesByPollController";
import { updateResponseController } from "../responses/controllers/updateResponseController";
import { deleteResponseController } from "../responses/controllers/deleteResponseController";
import { getUserResponseForPollController } from "../responses/controllers/getUserResponseForPollController";

const router = Router();

/**
 * @openapi
 * /polls/{id}/responses:
 *   post:
 *     summary: Submit a response to a poll
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *     responses:
 *       201:
 *         description: Response recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/:id/responses', auth, submitResponseController);

/**
 * @openapi
 * /polls/{id}/responses:
 *   get:
 *     summary: Get all responses for a poll
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of responses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Response'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id/responses', auth, getResponsesByPollController);

/**
 * @openapi
 * /polls/{id}/responses/{responseId}:
 *   put:
 *     summary: Update a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *     responses:
 *       200:
 *         description: Response updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id/responses/:responseId', auth, updateResponseController);

/**
 * @openapi
 * /polls/{id}/responses/{responseId}:
 *   delete:
 *     summary: Delete a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response deleted
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id/responses/:responseId', auth, deleteResponseController);

/**
 * @openapi
 * /polls/users/me/responses/{pollId}:
 *   get:
 *     summary: Get current user's response for a poll
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/users/me/responses/:pollId', auth, getUserResponseForPollController);

export default router;