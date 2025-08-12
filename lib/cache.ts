const cache = new Map<string, any>()

export function saveToCache(key: string, value: any): void {
    cache.set(key, value)
}

export function getFromCache(key: string): any | undefined {
    return cache.get(key)
}

interface CachedValue<T> {
    value: T
    expiresAt?: number
}

export async function cacheWrapper<T>(key: string, expiresInSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = getFromCache(key) as CachedValue<T> | undefined
    if (cached?.expiresAt && cached.expiresAt > Date.now()) {
        console.log('Returning cached value', key)
        return cached.value
    }
    const result = await fn()
    const expiry = Date.now() + expiresInSeconds * 1000
    const cachedValue: CachedValue<T> = { expiresAt: expiry, value: result }
    console.log('Updating cache', key)
    saveToCache(key, cachedValue)
    return result
}
