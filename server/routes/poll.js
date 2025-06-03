import express from 'express'
import auth from '../middleware/auth.js'
import {
    createPoll,
    getAllPolls,
    getPollById,
    submitResponse,
    getResponsesByPoll
} from '../controllers/pollController.js'

const router = express.Router()

// GET all polls (public)
router.get('/', getAllPolls)

// GET single poll
router.get('/:id', getPollById)

// POST create poll
router.post('/', auth, createPoll)

// POST response
router.post('/:id/responses', auth, submitResponse)

// GET responses to a poll (only creator can access)
router.get('/:id/responses', auth, getResponsesByPoll)

export default router
