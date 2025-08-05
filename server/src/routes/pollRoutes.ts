import { Router } from 'express'
import auth from '../middleware/auth'
import { getAllPollsController } from "../polls/controllers/getAllPollsController";
import { getPollByIdController } from "../polls/controllers/getPollByIdController";
import { createPollController } from "../polls/controllers/createPollController";
import { updatePollController } from "../polls/controllers/updatePollController";
import { deletePollController } from "../polls/controllers/deletePollController";
import { submitResponseController } from "../responses/controllers/submitResponseController";
import { getResponsesByPollController } from "../responses/controllers/getResponsesByPollController";
import { updateResponseController } from "../responses/controllers/updateResponseController";
import { deleteResponseController } from "../responses/controllers/deleteResponseController";
import { getPollStatsController } from "../polls/controllers/getPollStatsController";
import { getUserResponseForPollController } from "../responses/controllers/getUserResponseForPollController";

const router = Router()

router.get('/', getAllPollsController)
router.get('/:id', getPollByIdController)
router.post('/', auth, createPollController)
router.put('/:id', auth, updatePollController)
router.delete('/:id', auth, deletePollController)

router.post('/:id/responses', auth, submitResponseController)
router.get('/:id/responses', auth, getResponsesByPollController)
router.put('/:id/responses/:responseId', auth, updateResponseController)
router.delete('/:id/responses/:responseId', auth, deleteResponseController)
router.get('/:id/stats', auth, getPollStatsController)

router.get('/users/me/responses/:pollId', auth, getUserResponseForPollController)

export default router
