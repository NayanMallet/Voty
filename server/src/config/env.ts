import dotenvFlow from 'dotenv-flow'
dotenvFlow.config({ silent: true })

function required(name: string): string {
    const v = process.env[name]
    if (!v) {
        // en prod on préfère fail-fast
        throw new Error(`${name} is not defined`)
    }
    return v
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',

    // **clé** : en test, on ne l’exige pas (mongodb-memory-server)
    MONGO_URI: process.env.NODE_ENV === 'test'
        ? (process.env.MONGO_URI ?? '')
        : required('MONGO_URI'),
} as const