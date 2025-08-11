import jwt from 'jsonwebtoken'
import User from '../models/User'
import type { RegisterDTO, LoginDTO } from '../validators/authValidator'
import { HttpError } from '../../lib/http_error'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

/**
 * Service pour enregistrer un nouvel utilisateur.
 * @param data - Données de l'utilisateur à enregistrer
 * @returns Token JWT
 */
export async function registerUser(data: RegisterDTO): Promise<string> {
    const { name, email, password } = data

    let user = await User.findOne({ email })
    if (user) throw new HttpError(400, 'User already exists')

    user = new User({ name, email, password })
    await user.save()

    const payload = { user: { id: user._id.toString() } }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

/**
 * Service pour connecter un utilisateur existant.
 * @param data - Données de connexion
 * @returns Token JWT
 */
export async function loginUser(data: LoginDTO): Promise<string> {
    const { email, password } = data

    const user = await User.findOne({ email })
    if (!user) throw new HttpError(401, 'Invalid credentials')

    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new HttpError(401, 'Invalid credentials')

    const payload = { user: { id: user._id.toString() } }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}
