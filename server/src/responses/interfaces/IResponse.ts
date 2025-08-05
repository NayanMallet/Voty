import { Document, Types } from 'mongoose'


/**
 * Interface représentant une réponse à une question dans un sondage.
 * Chaque réponse est associée à un identifiant de question et peut contenir une réponse sous forme de chaîne, tableau de chaînes ou date.
 */
export interface Answer {
    question_id: Types.ObjectId
    answer: string | string[] | Date
    type?: ResponseType
}

/**
 * Interface représentant une réponse à un sondage.
 * Chaque réponse est associée à un identifiant de sondage et d'utilisateur, ainsi qu'à un tableau de réponses.
 */
export interface IResponse extends Document {
    poll_id: Types.ObjectId
    user_id: Types.ObjectId
    answers: Answer[]
    createdAt: Date
    updatedAt: Date
}
