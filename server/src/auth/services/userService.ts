import User from '../models/User'
import {
    UpdateEmailDTO,
    UpdateNameDTO,
    UpdatePasswordDTO,
    DeleteAccountDTO
} from '../validators/userValidator'

/**
 * Service pour mettre à jour le nom de l'utilisateur.
 * @param userId - ID de l'utilisateur
 * @param data - Données de mise à jour du nom
 * @returns L'utilisateur mis à jour
 */
export async function updateName(userId: string, data: UpdateNameDTO) {
    const user = await User.findByIdAndUpdate(userId, { name: data.name }, { new: true }).select('-password')
    if (!user) throw new Error('User not found')
    return user
}

/**
 * Service pour mettre à jour l'email de l'utilisateur.
 * @param userId - ID de l'utilisateur
 * @param data - Données de mise à jour de l'email
 * @returns L'utilisateur mis à jour
 */
export async function updateEmail(userId: string, data: UpdateEmailDTO) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const isMatch = await user.comparePassword(data.password)
    if (!isMatch) throw new Error('Invalid credentials')

    const existing = await User.findOne({ email: data.email })
    if (existing && existing.id !== user.id) throw new Error('User already exists')

    user.email = data.email
    await user.save()
    return user.toObject()
}

/**
 * Service pour mettre à jour le mot de passe de l'utilisateur.
 * @param userId - ID de l'utilisateur
 * @param data - Données de mise à jour du mot de passe
 * @returns L'utilisateur mis à jour
 */
export async function updatePassword(userId: string, data: UpdatePasswordDTO) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const isMatch = await user.comparePassword(data.currentPassword)
    if (!isMatch) throw new Error('Invalid credentials')

    user.password = data.newPassword
    await user.save()
}

/**
 * Service pour supprimer le compte de l'utilisateur.
 * @param userId - ID de l'utilisateur
 * @param data - Données de suppression du compte
 */
export async function deleteAccount(userId: string, data: DeleteAccountDTO) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const isMatch = await user.comparePassword(data.password)
    if (!isMatch) throw new Error('Invalid credentials')

    await User.findByIdAndDelete(userId)
}
