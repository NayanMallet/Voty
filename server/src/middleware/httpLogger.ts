import pinoHttp from 'pino-http'
import { logger } from '../lib/logger'
import type { Request } from 'express'
import crypto from 'crypto'

function genReqId(req: Request) {
    // Priorité à un header si tu fais transiter un id (CF-Request-ID, X-Request-ID…)
    return req.headers['x-request-id']?.toString() ?? crypto.randomUUID()
}

export const httpLogger = pinoHttp({
    logger,
    genReqId,
    autoLogging: {
        ignore: (req) => req.url?.startsWith('/docs') || req.url?.startsWith('/health') || false,
    },
    serializers: {
        // réduit le bruit dans la CLI
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                ip: req.socket?.remoteAddress,
                userAgent: req.headers['user-agent'],
            }
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            }
        },
    },
})
