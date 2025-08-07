import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Initialise la connexion à MongoDB avec les options recommandées.
 * @throws Si la connexion échoue
 */
const connectDB = async (): Promise<void> => {
    try {
        let uri = process.env.MONGO_URI;

        if (process.env.NODE_ENV === 'test') {
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        if (!uri) throw new Error('MONGO_URI is not defined');

        await mongoose.connect(uri);
        console.log(`✅ MongoDB connected (${process.env.NODE_ENV})`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', (error as Error).message);
        if (process.env.NODE_ENV !== 'test') process.exit(1);
        else throw error;
    }
};

export const closeDB = async (): Promise<void> => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
};

export default connectDB;