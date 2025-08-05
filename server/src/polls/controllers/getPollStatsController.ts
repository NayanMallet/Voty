import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth'
import Poll from '../../polls/models/Poll'
import ResponseModel from '../../responses/models/Response'
import { QuestionWithId } from '../interfaces/IPoll'

/**
 * Controller to get statistics for a poll.
 * Returns total responses and stats per question.
 */
export const getPollStatsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const pollId = req.params.id
        const userId = req.user!.id

        const poll = await Poll.findById(pollId).lean<{
            questions: QuestionWithId[]
            creator: any
        }>()

        if (!poll) {
            res.status(404).json({ message: 'Poll not found' })
            return
        }

        if (poll.creator.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized' })
            return
        }

        const responses = await ResponseModel.find({ poll_id: pollId }).populate('user_id', 'name email')

        const statsPerQuestion = poll.questions.map(q => {
            const base = {
                _id: q._id,
                title: q.title,
                type: q.type,
                total: 0,
                stats: [],
                topAnswers: [],
                responses: []
            }

            if (q.type === 'multiple_choice') {
                const counts = Object.fromEntries((q.options || []).map(opt => [opt, 0]))

                for (const resp of responses) {
                    const answerObj = resp.answers.find(a => a.question_id.toString() === q._id.toString())
                    if (!answerObj) continue

                    const ans = answerObj.answer
                    if (Array.isArray(ans)) {
                        for (const opt of ans) {
                            if (counts[opt] !== undefined) counts[opt]++
                        }
                    } else if (typeof ans === 'string') {
                        if (counts[ans] !== undefined) counts[ans]++
                    }
                }

                const total = Object.values(counts).reduce((a, b) => a + b, 0)
                return {
                    ...base,
                    total,
                    stats: Object.entries(counts).map(([option, count]) => ({ option, count }))
                }
            }

            // open questions
            const answerMap = new Map<string, number>()
            const detailed = []

            for (const resp of responses) {
                const answerObj = resp.answers.find(a => a.question_id.toString() === q._id.toString())
                if (!answerObj) continue

                const answer = String(answerObj.answer).trim()
                if (!answer) continue

                detailed.push({
                    _id: resp._id,
                    user: resp.user_id,
                    answer
                })

                answerMap.set(answer, (answerMap.get(answer) || 0) + 1)
            }

            return {
                ...base,
                topAnswers: [...answerMap.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([answer]) => answer),
                responses: detailed
            }
        })

        res.json({
            totalResponses: responses.length,
            questions: statsPerQuestion
        })
    } catch (err) {
        console.error('[getPollStatsController]', (err as Error).message)
        res.status(500).json({ message: 'Server error' })
    }
}
