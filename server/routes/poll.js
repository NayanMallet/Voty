import express from 'express'
import auth from '../middleware/auth.js'
import {
    createPoll,
    getAllPolls,
    getPollById,
    submitResponse,
    getResponsesByPoll,
    updatePoll,
    deletePoll, updateResponse, getPollStats
} from '../controllers/pollController.js'

const router = express.Router()

// GET all polls (public)
router.get('/', getAllPolls)

// GET single poll
router.get('/:id', getPollById)

// POST create poll
router.post('/', auth, createPoll)

// Mettre à jour un sondage
router.put('/:id', auth, updatePoll)

// Supprimer un sondage
router.delete('/:id', auth, deletePoll)

// POST response
router.post('/:id/responses', auth, submitResponse)

// GET responses to a poll (only creator can access)
router.get('/:id/responses', auth, getResponsesByPoll)

// PUT: update a response (auth, only author)
router.put('/:id/responses/:responseId', auth, updateResponse)

// GET stats for a poll
router.get('/:id/stats', auth, getPollStats)


export default router
