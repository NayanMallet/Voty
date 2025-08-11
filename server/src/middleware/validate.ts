import type { RequestHandler } from 'express'
import type { ZodTypeAny } from 'zod'
import { HttpError } from '../lib/http_error'

export const validateBody = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
    try {
        req.body = schema.parse(req.body) // on remplace par la version typée/clean
        next()
    } catch (e: any) {
        next(new HttpError(400, 'Invalid payload', e?.issues))
    }
}
