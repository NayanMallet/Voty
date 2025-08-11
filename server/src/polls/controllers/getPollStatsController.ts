import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import Poll from '../../polls/models/Poll'
import ResponseModel from '../../responses/models/Response'
import { HttpError } from '../../lib/http_error'
import type { QuestionWithId } from '../interfaces/IPoll'

export const getPollStatsController = async (req: AuthenticatedRequest, res: Response) => {
    const pollId = req.params.id
    const userId = req.user!.id

    const poll = await Poll.findById(pollId).lean<{ questions: QuestionWithId[]; creator: any }>()
    if (!poll) throw new HttpError(404, 'Poll not found')
    if (poll.creator.toString() !== userId) throw new HttpError(403, 'Not authorized')

    const responses = await ResponseModel.find({ poll_id: pollId }).populate('user_id', 'name email')

    const questions = poll.questions.map(q => {
        const base = {
            _id: q._id,
            title: q.title,
            type: q.type,
            total: 0,
            stats: [] as Array<{ option: string; count: number }>,
            topAnswers: [] as string[],
            responses: [] as Array<{ _id: any; user: any; answer: string }>
        }

        if (q.type === 'multiple_choice') {
            const counts: Record<string, number> = Object.fromEntries((q.options || []).map(opt => [opt, 0]))
            for (const resp of responses) {
                const a = resp.answers.find(x => x.question_id.toString() === q._id.toString())
                if (!a) continue
                const v = a.answer
                if (Array.isArray(v)) v.forEach(opt => { if (counts[opt] !== undefined) counts[opt]++ })
                else if (typeof v === 'string' && counts[v] !== undefined) counts[v]++
            }
            const total = Object.values(counts).reduce((a, b) => a + b, 0)
            return { ...base, total, stats: Object.entries(counts).map(([option, count]) => ({ option, count })) }
        }

        const map = new Map<string, number>()
        const detailed: Array<{ _id: any; user: any; answer: string }> = []
        for (const resp of responses) {
            const a = resp.answers.find(x => x.question_id.toString() === q._id.toString())
            if (!a) continue
            const ans = String(a.answer).trim()
            if (!ans) continue
            detailed.push({ _id: resp._id, user: resp.user_id, answer: ans })
            map.set(ans, (map.get(ans) || 0) + 1)
        }

        return {
            ...base,
            topAnswers: [...map.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([ans]) => ans),
            responses: detailed,
        }
    })

    req.log?.info(
        {
            event: 'polls.stats',
            outcome: 'success',
            pollId,
            targetUserId: userId,
            totalResponses: responses.length,
            questionCount: poll.questions.length
        },
        'Computed poll stats'
    )
    res.json({ totalResponses: responses.length, questions })
}
