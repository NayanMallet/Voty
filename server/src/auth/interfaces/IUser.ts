import { Document, Types } from 'mongoose'

/**
 * Interface représentant un utilisateur dans l'application.
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    _id: Types.ObjectId;
}