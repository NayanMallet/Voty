import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['open', 'multiple_choice'], required: true },
    options: [String], // predefined answers for multiple choice questions
})

const pollSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
}, {
    timestamps: true,
})

const Poll = mongoose.model('Poll', pollSchema)
export default Poll