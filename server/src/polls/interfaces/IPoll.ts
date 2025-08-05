import { Document, Types } from 'mongoose'
import { QuestionType, QuestionSubType, PollStatus } from '../enums/PollStatus'

/**
 * Interface représentant une question dans un sondage.
 */
export interface Question {
    title: string
    type: QuestionType
    subType?: QuestionSubType
    options?: string[]
}

export interface QuestionWithId extends Question {
    _id: Types.ObjectId
}

/**
 * Interface représentant un sondage dans l'application.
 */
export interface IPoll extends Document {
    name: string
    creator: Types.ObjectId
    description?: string
    questions: Question[]
    status: PollStatus
    createdAt: Date
    updatedAt: Date
}
