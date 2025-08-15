const cacheSimple = new Map<string, any>()

const cache = await caches.open('default')

export async function saveToWebCache(req: string, response: Response, expiresInMins: number): Promise<void> {
  const expiringResponse = response.clone()
  const expires = new Date(Date.now() + expiresInMins * 60 * 1000)
  expiringResponse.headers.set('Expires', expires.toUTCString())
  await cache.put(req, expiringResponse)
}

export async function getFromWebCache(req: string): Promise<Response | undefined> {
  return await cache.match(req)
}

export async function clearWebCache(req: string): Promise<void> {
  await cache.delete(req)
}

export function saveToCache(key: string, value: any): void {
  cacheSimple.set(key, value)
}

export function getFromCache(key: string): any | undefined {
  return cacheSimple.get(key)
}

interface CachedValue<T> {
  value: T
  expiresAt?: number
}

export async function cacheWrapper<T>(
  key: string,
  expiresInSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
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
