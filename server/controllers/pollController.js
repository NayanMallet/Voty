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

export const updatePoll = async (req, res) => {
    const { id: pollId } = req.params;
    const userId = req.user.id;
    const { name, questions } = req.body;

    try {
        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.creator.toString() !== userId)
            return res.status(403).json({ message: 'Not authorized' });

        if (name) poll.name = name;
        if (questions && Array.isArray(questions)) {
            poll.questions = questions;
        }

        await poll.save();
        res.json({ message: 'Poll updated', poll });
    } catch (err) {
        console.error('Update poll error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePoll = async (req, res) => {
    const { id: pollId } = req.params;
    const userId = req.user.id;

    try {
        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.creator.toString() !== userId)
            return res.status(403).json({ message: 'Not authorized' });

        await poll.deleteOne();
        res.json({ message: 'Poll deleted successfully' });
    } catch (err) {
        console.error('Delete poll error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

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

export const updateResponse = async (req, res) => {
    try {
        const { id: pollId, responseId } = req.params;
        const userId = req.user.id;
        const { answers } = req.body;

        const response = await Response.findById(responseId);
        if (!response) return res.status(404).json({ message: 'Response not found' });

        if (
            response.poll_id.toString() !== pollId ||
            response.user_id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized to update this response' });
        }

        response.answers = answers;
        await response.save();

        res.json({ message: 'Response updated', response });
    } catch (err) {
        console.error('Update response error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPollStats = async (req, res) => {
    try {
        const { id: pollId } = req.params;
        const userId = req.user.id;

        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.creator.toString() !== userId)
            return res.status(403).json({ message: 'Not authorized' });

        const responses = await Response.find({ poll_id: pollId });

        const stats = {
            totalResponses: responses.length,
            questions: {}
        };

        for (const question of poll.questions) {
            if (question.type === 'multiple_choice') {
                stats.questions[question._id] = {
                    title: question.title,
                    type: question.type,
                    options: Object.fromEntries(
                        question.options.map(opt => [opt, 0])
                    )
                };
            }
        }

        for (const response of responses) {
            for (const answer of response.answers) {
                const stat = stats.questions[answer.question_id];
                if (stat && Array.isArray(answer.answer)) {
                    for (const option of answer.answer) {
                        if (stat.options[option] !== undefined) {
                            stat.options[option] += 1;
                        }
                    }
                }
            }
        }

        res.json(stats);
    } catch (err) {
        console.error('Poll stats error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


