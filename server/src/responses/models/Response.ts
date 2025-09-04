import { Schema, Model, model } from 'mongoose'
import { IResponse, Answer } from '../interfaces/IResponse'

/**
 * Schéma Mongoose pour le modèle de réponse.
 * Chaque réponse est associée à un identifiant de sondage et d'utilisateur,
 * et contient un tableau de réponses aux questions du sondage.
 * Chaque réponse à une question est associée à un identifiant de question et peut contenir
 * une réponse sous forme de chaîne, tableau de chaînes ou date.
 */
const answerSchema = new Schema<Answer>({
    question_id: { type: Schema.Types.ObjectId, required: true },
    answer: { type: Schema.Types.Mixed }
})

/**
 * Schéma Mongoose pour le modèle de réponse.
 * Il inclut les identifiants de sondage et d'utilisateur, ainsi qu'un tableau
 * de réponses aux questions du sondage.
 * Le schéma utilise des timestamps pour suivre les dates de création et de mise à jour.
 */
const responseSchema = new Schema<IResponse>({
    poll_id: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerSchema]
}, {
    timestamps: true
})

responseSchema.index({ poll_id: 1, user_id: 1 }, { unique: true })

const Response: Model<IResponse> = model<IResponse>('Response', responseSchema)
export default Response
