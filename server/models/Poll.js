import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['open', 'multiple_choice'], required: true },
    subType: { type: String, enum: ['short', 'paragraph', 'date', 'single', 'multiple'] },
    options: [String],
})

const pollSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    status: { type: String, enum: ['opened', 'closed', 'deleted'], required: true },
}, {
    timestamps: true,
})

const Poll = mongoose.model('Poll', pollSchema)
export default Poll
