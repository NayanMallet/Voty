import {Model, model, Schema} from 'mongoose'
import {IUser} from '../interfaces/IUser'
import argon2 from 'argon2'

/**
 * Schéma Mongoose pour le modèle User.
 */
const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware exécuté avant la sauvegarde de l'utilisateur.
 * Hash le mot de passe s'il a été modifié.
 * @param next - La fonction de rappel pour passer au middleware suivant.
 * @throws {Error} Si le hachage échoue.
 */
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (err) {
        next(err as Error);
    }
});

/**
 * Méthode pour comparer un mot de passe en clair avec le hash stocké.
 * @param candidatePassword - Le mot de passe en clair à comparer.
 * @returns Une promesse qui résout à true si les mots de passe correspondent, sinon false.
 * @throws {Error} Si la comparaison échoue.
 */
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return argon2.verify(this.password, candidatePassword);
};

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;