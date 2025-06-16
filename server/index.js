import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import protectedRoutes from './routes/protected.js'
import pollRoutes from './routes/poll.js'
import userRoutes from './routes/users.js'
import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

connectDB()

app.use(express.json())

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))
app.use('/api/auth', authRoutes)
app.use('/api/protected', protectedRoutes)
app.use('/api/polls', pollRoutes)
app.use('/api/users', userRoutes)


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
