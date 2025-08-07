import express from 'express';
import dotenvFlow from 'dotenv-flow';
import cors from 'cors';
import connectDB from './config/connectDB';
import { setupSwagger } from './config/swagger';

// Routes
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import pollRoutes from './routes/pollRoutes';
import responsesRoutes from "./routes/responsesRoutes";


dotenvFlow.config();
console.log('JWT_SECRET from dotenv-flow:', process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/polls', responsesRoutes);

if (process.env.NODE_ENV !== 'test') {
    connectDB();
    setupSwagger(app);
    const PORT = process.env.PORT || 3000;
    console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

export default app;
