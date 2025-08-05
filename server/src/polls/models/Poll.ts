import { Schema, Model, model } from 'mongoose'
import { IPoll, Question } from '../interfaces/IPoll'
import { PollStatus, QuestionType, QuestionSubType } from '../enums/PollStatus'

/**
 * Schéma Mongoose pour le modèle Question.
 * Représente une question dans un sondage, avec un titre, un type, un sous-type et des options.
 * Le type et le sous-type sont des énumérations définies dans PollStatus.ts.
 * Les options sont un tableau de chaînes de caractères, représentant les choix possibles
 * pour la question.
 */
const questionSchema = new Schema<Question>({
    title: { type: String, required: true },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    subType: { type: String, enum: Object.values(QuestionSubType), required: false },
    options: [{ type: String }]
})

/**
 * Schéma Mongoose pour le modèle Poll.
 * Inclut des informations sur le créateur, la description, les questions et le statut du
 * sondage.
 */
const pollSchema = new Schema<IPoll>({
    name: { type: String, required: true, unique: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    status: { type: String, enum: Object.values(PollStatus), required: true }
}, {
    timestamps: true
})

const Poll: Model<IPoll> = model<IPoll>('Poll', pollSchema)
export default Poll
