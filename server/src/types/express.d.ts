import 'express-serve-static-core'

declare module 'express-serve-static-core' {
    // Augmente le type de requête pour inclure log
    interface Request {
        log?: {
            info: (...args: any[]) => void
            warn: (...args: any[]) => void
            error: (...args: any[]) => void
            child?: (bindings: Record<string, any>) => any
        }
    }
}
