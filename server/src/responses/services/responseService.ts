import { Types } from 'mongoose'

import Response from '../models/Response'
import Poll from '../../polls/models/Poll'
import { SubmitResponseDTO, UpdateResponseDTO } from '../validators/responseValidator'

/**
 * Enregistre une nouvelle réponse pour un sondage.
 * @param userId - ID de l'utilisateur répondant
 * @param pollId - ID du sondage concerné
 * @param data - Réponses de l'utilisateur
 * @returns La réponse enregistrée
 * @throws Si l'utilisateur a déjà répondu ou si le sondage n'existe pas
 */
export async function submitResponse(userId: string, pollId: string, data: SubmitResponseDTO) {
    const poll = await Poll.findById(pollId)
    if (!poll) throw new Error('Poll not found')

    const alreadyAnswered = await Response.findOne({ poll_id: pollId, user_id: userId })
    if (alreadyAnswered) throw new Error('You have already answered this poll')

    const response = new Response({
        poll_id: pollId,
        user_id: userId,
        answers: data.answers
    })

    return response.save()
}

/**
 * Met à jour une réponse existante.
 * @param userId - ID de l'utilisateur
 * @param pollId - ID du sondage
 * @param responseId - ID de la réponse
 * @param data - Réponses mises à jour
 * @returns La réponse mise à jour
 * @throws Si la réponse n'existe pas ou que l'utilisateur n'est pas autorisé
 */
export async function updateResponse(userId: string, pollId: string, responseId: string, data: UpdateResponseDTO) {
    const response = await Response.findById(responseId)
    if (!response) throw new Error('Response not found')

    if (
        response.poll_id.toString() !== pollId ||
        response.user_id.toString() !== userId
    ) {
        throw new Error('Not authorized to update this response')
    }

    response.answers = data.answers.map(a => ({
        question_id: new Types.ObjectId(a.question_id),
        answer: a.answer
    }))

    return response.save()
}

/**
 * Supprime une réponse (par l’auteur du sondage uniquement).
 * @param userId - ID du créateur du sondage
 * @param pollId - ID du sondage
 * @param responseId - ID de la réponse à supprimer
 * @throws Si la réponse ou le sondage n'existe pas ou si non autorisé
 */
export async function deleteResponse(userId: string, pollId: string, responseId: string) {
    const poll = await Poll.findById(pollId)
    if (!poll) throw new Error('Poll not found')
    if (poll.creator.toString() !== userId) throw new Error('Not authorized')

    const deleted = await Response.findByIdAndDelete(responseId)
    if (!deleted) throw new Error('Response not found')
}

/**
 * Récupère toutes les réponses à un sondage (créateur uniquement).
 * @param userId - ID du créateur
 * @param pollId - ID du sondage
 * @returns Liste des réponses
 */
export async function getResponsesByPoll(userId: string, pollId: string) {
    const poll = await Poll.findById(pollId)
    if (!poll) throw new Error('Poll not found')
    if (poll.creator.toString() !== userId) throw new Error('Not authorized')

    return Response.find({ poll_id: pollId }).populate('user_id', 'name email').select('-__v')
}

/**
 * Récupère la réponse de l’utilisateur courant à un sondage donné.
 * @param userId - ID utilisateur
 * @param pollId - ID du sondage
 * @returns La réponse trouvée ou null
 */
export async function getUserResponseForPoll(userId: string, pollId: string) {
    return Response.findOne({ poll_id: pollId, user_id: userId })
}
