import Poll from '../models/Poll.js'
import Response from '../models/Response.js'

export const createPoll = async (req, res) => {
    console.log('→ payload received:', req.body)
    try {
        const { name, description, questions } = req.body

        if (!name || !questions || !Array.isArray(questions) || questions.length === 0 ) {
            return res.status(400).json({ message: 'Name and questions are required !' })
        }

        for (const q of questions) {
            if (!q.title) {
                return res.status(400).json({ message: 'All questions must have a title!' })
            }
        }

        const poll = new Poll({
            name,
            description: description || '',
            creator: req.user.id,
            questions,
            status: 'opened',
        })

        await poll.save()
        res.status(201).json({ message: 'Poll created!', poll })
    } catch (err) {
        console.error('Error creating poll:', err.message)

        // Check for duplicate key error
        if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
            return res.status(400).json({ 
                message: `A poll with the name "${err.keyValue.name}" already exists. Please use a different name.` 
            })
        }

        res.status(500).json({ message: 'Server error!' })
    }
}

export const updatePoll = async (req, res) => {
    const { id: pollId } = req.params
    const userId = req.user.id
    const { name, description, questions, status } = req.body

    try {
        const poll = await Poll.findById(pollId)
        if (!poll) return res.status(404).json({ message: 'Poll not found' })

        if (poll.creator.toString() !== userId)
            return res.status(403).json({ message: 'Not authorized' })

        if (name) poll.name = name
        if (description !== undefined) poll.description = description // ✅ autorise update
        if (questions && Array.isArray(questions)) poll.questions = questions
        if (status) poll.status = status // ✅ handle status update

        await poll.save()
        res.json({ message: 'Poll updated', poll })
    } catch (err) {
        console.error('Update poll error:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}

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
        const polls = await Poll.find()
            .select('-__v')
            .populate('creator', 'name email')
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
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

export const getUserResponseForPoll = async (req, res) => {
    const { pollId } = req.params
    const response = await Response.findOne({
        poll_id: pollId,
        user_id: req.user.id
    })

    if (!response) return res.json(null)
    res.json(response)
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

        const responses = await Response.find({ poll_id: pollId }).populate('user_id', 'name email');

        const statsPerQuestion = poll.questions.map(q => {
            const base = {
                _id: q._id,
                title: q.title,
                type: q.type,
                total: 0,
                stats: [],
                topAnswers: [],
                responses: []
            };

            if (q.type === 'multiple_choice') {
                const counts = Object.fromEntries(q.options.map(opt => [opt, 0]));

                for (const resp of responses) {
                    const answerObj = resp.answers.find(a => a.question_id.equals(q._id));
                    if (!answerObj) continue;

                    // 1️⃣ Si c'est un array, on boucle (cas “multiple”)
                    if (Array.isArray(answerObj.answer)) {
                        for (const opt of answerObj.answer) {
                            if (counts[opt] !== undefined) counts[opt]++;
                        }
                    }
                    // 2️⃣ Sinon, c’est une string (cas “single” radio) → on incrémente directement
                    else if (typeof answerObj.answer === 'string') {
                        const opt = answerObj.answer;
                        if (counts[opt] !== undefined) counts[opt]++;
                    }
                }

                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                return {
                    _id: q._id,
                    title: q.title,
                    type: q.type,
                    total,
                    stats: Object.entries(counts).map(([option, count]) => ({ option, count }))
                };
            }

            // OPEN QUESTIONS
            const answerMap = new Map();
            const detailed = [];

            for (const resp of responses) {
                const answerObj = resp.answers.find(a => a.question_id.equals(q._id));
                if (!answerObj) continue;

                const answer = String(answerObj.answer).trim();
                if (!answer) continue;

                detailed.push({
                    _id: resp._id,
                    user: resp.user_id,
                    answer
                });

                answerMap.set(answer, (answerMap.get(answer) || 0) + 1);
            }

            return {
                ...base,
                topAnswers: [...answerMap.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([answer]) => answer),
                responses: detailed
            };
        });

        res.json({
            totalResponses: responses.length,
            questions: statsPerQuestion
        });
    } catch (err) {
        console.error('Poll stats error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteResponse = async (req, res) => {
    try {
        const { id: pollId, responseId } = req.params
        const userId = req.user.id

        const poll = await Poll.findById(pollId)
        if (!poll) return res.status(404).json({ message: 'Poll not found' })

        if (poll.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' })
        }

        const deleted = await Response.findByIdAndDelete(responseId)
        if (!deleted) return res.status(404).json({ message: 'Response not found' })

        res.json({ message: 'Response deleted' })
    } catch (err) {
        console.error('Delete response error:', err.message)
        res.status(500).json({ message: 'Server error' })
    }
}
