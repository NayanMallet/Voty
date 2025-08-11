import type { CreatorRef } from './poll'

export interface Answer {
    question_id: string
    answer: string | string[]
}

export interface ResponseDoc {
    _id: string
    poll_id: string
    user_id: CreatorRef
    answers: Answer[]
}

export interface SubmitResponseDTO { answers: Answer[] }
export interface UpdateResponseDTO { answers: Answer[] }
