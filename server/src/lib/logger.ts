import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: [
            'req.headers.authorization',
            'body.password',
            'body.oldPassword',
            'body.newPassword',
            'response.token',
        ],
        remove: true,
    },
    transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                singleLine: true,
            },
        },
})
