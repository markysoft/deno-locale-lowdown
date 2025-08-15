// deno-lint-ignore-file
const cacheSimple = new Map<string, any>()

const cache = await caches.open('default')

export async function saveToWebCache(req: string, item: any, expiresInMins: number): Promise<void> {
  const expiringResponse = new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' },
  })
	
		console.log('Crating cache for:', req)
  const expires = new Date(Date.now() + expiresInMins * 60 * 1000)
  expiringResponse.headers.set('Expires', expires.toUTCString())
  await cache.put(req, expiringResponse)
}

function isExpired(value: Response | undefined) {
  const expires = value?.headers.get('Expires')
  if (expires == undefined) {
    return true
  }
  return new Date(expires) < new Date()
}

export async function getFromWebCache(req: string): Promise<any | undefined> {
  const value = await cache.match(req)
  if (isExpired(value)) {
		console.log('Cache expired for:', req)
    return undefined
  }
		console.log('returning cache for:', req)
  return value ? value.json() : undefined
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
