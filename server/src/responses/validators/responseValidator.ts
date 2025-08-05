import { z } from 'zod'

export const answerSchema = z.object({
    question_id: z.string().min(1),
    answer: z.union([
        z.string(),
        z.array(z.string()),
        z.date()
    ])
})

export const submitResponseSchema = z.object({
    answers: z.array(answerSchema).min(1)
})

export const updateResponseSchema = z.object({
    answers: z.array(answerSchema).min(1)
})

export type SubmitResponseDTO = z.infer<typeof submitResponseSchema>
export type UpdateResponseDTO = z.infer<typeof updateResponseSchema>
