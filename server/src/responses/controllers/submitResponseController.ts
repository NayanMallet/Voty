import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth'
import { submitResponse } from '../services/responseService'

export const submitResponseController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const pollId = req.params.id
    const response = await submitResponse(userId, pollId, req.body)

    req.log?.info(
        {
            event: 'responses.submit',
            outcome: 'success',
            pollId,
            targetUserId: userId,
            responseId: (response as any)?._id ?? (response as any)?.id
        },
        'Response submitted'
    )
    res.status(201).json({ message: 'Response recorded successfully', response })
}
