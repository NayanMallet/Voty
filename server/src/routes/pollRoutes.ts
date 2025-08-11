import { Router } from 'express';

import auth from '../middleware/auth';
import { validateBody } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'

import { createPollSchema, updatePollSchema } from '../polls/validators/pollValidator'

import { getAllPollsController } from "../polls/controllers/getAllPollsController";
import { getPollByIdController } from "../polls/controllers/getPollByIdController";
import { createPollController } from "../polls/controllers/createPollController";
import { updatePollController } from "../polls/controllers/updatePollController";
import { deletePollController } from "../polls/controllers/deletePollController";
import { getPollStatsController } from "../polls/controllers/getPollStatsController";

const router = Router();

/**
 * @openapi
 * /polls:
 *   get:
 *     summary: Get all polls
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: List of all polls
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', asyncHandler(getAllPollsController))

/**
 * @openapi
 * /polls/{id}:
 *   get:
 *     summary: Get a poll by ID
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Poll data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', asyncHandler(getPollByIdController))

/**
 * @openapi
 * /polls:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePollInput'
 *     responses:
 *       201:
 *         description: Poll created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', auth, validateBody(createPollSchema), asyncHandler(createPollController))

/**
 * @openapi
 * /polls/{id}:
 *   put:
 *     summary: Update a poll
 *     tags: [Polls]
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
 *             $ref: '#/components/schemas/CreatePollInput'
 *     responses:
 *       200:
 *         description: Poll updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', auth, validateBody(updatePollSchema), asyncHandler(updatePollController))

/**
 * @openapi
 * /polls/{id}:
 *   delete:
 *     summary: Delete a poll
 *     tags: [Polls]
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
 *         description: Poll deleted
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, asyncHandler(deletePollController))

/**
 * @openapi
 * /polls/{id}/stats:
 *   get:
 *     summary: Get poll statistics
 *     tags: [Polls]
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
 *         description: Poll statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResponses:
 *                   type: integer
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id/stats', auth, asyncHandler(getPollStatsController))

export default router;
