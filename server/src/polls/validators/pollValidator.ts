import { z } from 'zod'
import { PollStatus, QuestionType, QuestionSubType } from '../enums/PollStatus'

export const questionSchema = z.object({
    title: z.string().min(1),
    type: z.enum(QuestionType),
    subType: z.enum(QuestionSubType).optional(),
    options: z.array(z.string()).optional()
})

export const createPollSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1)
})

export const updatePollSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    questions: z.array(questionSchema).optional(),
    status: z.enum(PollStatus).optional()
})

export type CreatePollDTO = z.infer<typeof createPollSchema>
export type UpdatePollDTO = z.infer<typeof updatePollSchema>
