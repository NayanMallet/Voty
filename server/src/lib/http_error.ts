export class HttpError extends Error {
    constructor(public status: number, message: string, public details?: unknown) {
        super(message)
    }
}
export const isHttpError = (e: unknown): e is HttpError =>
    typeof (e as any)?.status === 'number'
