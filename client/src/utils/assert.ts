export function invariant(cond: unknown, msg = 'Invariant failed'): asserts cond {
    if (!cond) throw new Error(msg)
}

export function assertDefined<T>(
    v: T | null | undefined,
    msg = 'Value is required'
): asserts v is T {
    if (v === null || v === undefined) throw new Error(msg)
}

export function isRecord(v: unknown): v is Record<string, unknown> {
    return !!v && typeof v === 'object' && !Array.isArray(v)
}

export function ensureArray<T>(v: unknown): T[] {
    if (Array.isArray(v)) return v as T[]
    if (v === null || v === undefined) return []
    return [v as T]
}

/** dev-only warning helper */
export function warn(cond: unknown, msg: string) {
    if (!cond) console.warn(msg)
}
