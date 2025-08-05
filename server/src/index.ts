import express, { Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/connectDB'

// Import des routes
import authRoutes from './routes/authRoutes'
import protectedRoutes from './routes/protectedRoutes'
import pollRoutes from './routes/pollRoutes'

// Chargement des variables d’environnement
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3000

// Connexion MongoDB
connectDB()

// Middlewares
app.use(express.json())

app.use(
    cors({
        origin: process.env.CLIENT_URL || '*',
        credentials: true,
    })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/protected', protectedRoutes)
app.use('/api/polls', pollRoutes)

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
