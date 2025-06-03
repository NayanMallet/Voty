import Poll from '../models/Poll.js'
import Response from '../models/Response.js'
import User from '../models/User.js'

export const createPoll = async (req, res) => {
    try {
        const { name, questions } = req.body

        if (!name || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Name and questions are required' })
        }

        const existing = await Poll.findOne({ name })
        if (existing) {
            return res.status(400).json({ message: 'A poll with that name already exists' })
        }

        const poll = new Poll({
            name,
            creator: req.user.id,
            questions,
        })

        await poll.save()
        res.status(201).json({ message: 'Poll created', poll })
    } catch (err) {
        console.error('Error creating poll:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getAllPolls = async (req, res) => {
    try {
        const polls = await Poll.find().select('-__v').populate('creator', 'name email')
        res.json(polls)
    } catch (err) {
        console.error('Error fetching polls:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getPollById = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).select('-__v')
        if (!poll) return res.status(404).json({ message: 'Poll not found' })
        res.json(poll)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
}

export const submitResponse = async (req, res) => {
    try {
        const { id: pollId } = req.params
        const { answers } = req.body

        const poll = await Poll.findById(pollId)
        if (!poll) return res.status(404).json({ message: 'Poll not found' })

        const existing = await Response.findOne({ poll_id: pollId, user_id: req.user.id })
        if (existing) return res.status(400).json({ message: 'You have already answered this poll' })

        const response = new Response({
            poll_id: pollId,
            user_id: req.user.id,
            answers
        })

        await response.save()
        res.status(201).json({ message: 'Response recorded' })
    } catch (err) {
        console.error('Submit response error:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getResponsesByPoll = async (req, res) => {
    try {
        const { id: pollId } = req.params
        const userId = req.user.id

        const poll = await Poll.findById(pollId)

        if (!poll) return res.status(404).json({ message: 'Poll not found' })

        if (poll.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view responses for this poll' })
        }

        const responses = await Response.find({ poll_id: pollId })
            .populate('user_id', 'name email')
            .select('-__v')

        res.json(responses)
    } catch (err) {
        console.error('Error fetching responses:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}


