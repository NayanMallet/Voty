import { z } from 'zod'

export const updateNameSchema = z.object({
    name: z.string().min(2)
})

export const updateEmailSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
})

export const deleteAccountSchema = z.object({
    password: z.string().min(6)
})

export type UpdateNameDTO = z.infer<typeof updateNameSchema>
export type UpdateEmailDTO = z.infer<typeof updateEmailSchema>
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>
export type DeleteAccountDTO = z.infer<typeof deleteAccountSchema>
