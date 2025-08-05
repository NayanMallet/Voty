import Poll from '../models/Poll'
import { CreatePollDTO, UpdatePollDTO } from '../validators/pollValidator'
import { PollStatus } from '../enums/PollStatus'

/**
 * Crée un nouveau sondage.
 * @param {string} userId - ID de l'utilisateur créateur
 * @param {CreatePollDTO} data - Données du sondage à créer
 * @returns {Promise<Poll>} Le sondage nouvellement créé
 * @throws {Error} Si une erreur se produit lors de la création du sondage
 * @description
 * Cette fonction crée un nouveau sondage dans la base de données.
 * Elle prend en paramètre l'ID de l'utilisateur créateur et les données du sondage à créer.
 * Un nouvel objet `Poll` est instancié avec les données fournies,
 * y compris le nom, la description, le créateur, les questions et le statut du sondage.
 * Le sondage est ensuite enregistré dans la base de données et renvoyé à l'appelant.
 * Si une erreur se produit lors de la création du sondage, elle est
 * levée pour être gérée par l'appelant.
 */
export async function createPoll(userId: string, data: CreatePollDTO) {
    const poll = new Poll({
        name: data.name,
        description: data.description || '',
        creator: userId,
        questions: data.questions,
        status: PollStatus.OPENED
    })
    return poll.save()
}

/**
 * Met à jour un sondage existant.
 * @param {string} pollId - ID du sondage à mettre à jour
 * @param {string} userId - ID de l'utilisateur créateur
 * @param {UpdatePollDTO} data - Données à mettre à jour
 * @returns {Promise<Poll>} Le sondage mis à jour
 * @throws {Error} Si le sondage n'existe pas ou si l'utilisateur n'est pas autorisé
 * @description
 * Cette fonction met à jour un sondage existant dans la base de données.
 * Elle vérifie d'abord si le sondage existe et si l'utilisateur qui tente de le
 * mettre à jour est bien le créateur du sondage. Si ces conditions ne sont pas
 * remplies, une erreur est levée.
 * Si le sondage est trouvé et que l'utilisateur est autorisé, les champs
 * spécifiés dans l'objet `data` sont mis à jour. Les champs suivants peuvent être
 * mis à jour : `name`, `description`, `questions` et `status`.
 * Le sondage mis à jour est ensuite enregistré dans la base de données et renvoyé
 * à l'appelant.
 */
export async function updatePoll(pollId: string, userId: string, data: UpdatePollDTO) {
    const poll = await Poll.findById(pollId)
    if (!poll) throw new Error('Poll not found')
    if (poll.creator.toString() !== userId) throw new Error('Not authorized')

    if (data.name) poll.name = data.name
    if (data.description !== undefined) poll.description = data.description
    if (data.questions) poll.questions = data.questions
    if (data.status) poll.status = data.status

    return poll.save()
}

/**
 * Supprime un sondage.
 * @param {string} pollId - ID du sondage à supprimer
 * @param {string} userId - ID de l'utilisateur créateur
 * @param {string} pollId - ID du sondage à supprimer
 * @param {string} userId - ID de l'utilisateur créateur
 * @returns {Promise<void>} Promise qui se résout lorsque le sondage est supprimé
 * @throws {Error} Si le sondage n'existe pas ou si l'utilisateur n'est pas autorisé
 * @description
 * Cette fonction supprime un sondage de la base de données. Elle vérifie d'abord
 * si le sondage existe et si l'utilisateur qui tente de le supprimer est bien
 * le créateur du sondage. Si ces conditions ne sont pas remplies, une erreur
 * est levée.
 * Si le sondage est trouvé et que l'utilisateur est autorisé, le sondage est
 * supprimé de la base de données.

 */
export async function deletePoll(pollId: string, userId: string) {
    const poll = await Poll.findById(pollId)
    if (!poll) throw new Error('Poll not found')
    if (poll.creator.toString() !== userId) throw new Error('Not authorized')
    await poll.deleteOne()
}

/**
 * Retourne tous les sondages.
 * @return {Promise<Poll[]>} Liste de tous les sondages
 * @throws {Error} Si une erreur se produit lors de la récupération des sondages
 * @description
 * Cette fonction récupère tous les sondages de la base de données,
 * en excluant la version interne (__v) et en peuplant les informations du créateur
 * (nom et email). Les sondages sont triés par date de création, du plus
 * récent au plus ancien.
 */
export async function getAllPolls() {
    return Poll.find().select('-__v').populate('creator', 'name email').sort({ createdAt: -1 })
}

/**
 * Récupère un sondage par ID.
 * @param {string} pollId - ID du sondage à récupérer
 * @returns {Promise<Poll | null>} Le sondage trouvé ou null s'il n'existe pas
 * @throws {Error} Si une erreur se produit lors de la récupération du sondage
 * @description
 * Cette fonction récupère un sondage spécifique à partir de son ID,
 * en excluant la version interne (__v). Si le sondage n'existe pas,
 * elle retourne null.
 */
export async function getPollById(pollId: string) {
    return Poll.findById(pollId).select('-__v')
}
