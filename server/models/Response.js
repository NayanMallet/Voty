import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: mongoose.Schema.Types.Mixed,
})

const responseSchema = new mongoose.Schema({
    poll_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerSchema],
}, {
    timestamps: true,
})

const Response = mongoose.model('Response', responseSchema)
export default Response
