// deno-lint-ignore-file
const cacheSimple = new Map<string, any>()

const cache = await caches.open('default')

function safeKey(req: string): string {
  return (!req.startsWith('http://') && !req.startsWith('https://')) ? 'http://' + req : req
}

export async function saveToWebCache(req: string, item: any, expiresInSeconds: number): Promise<void> {
  const expiringResponse = new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' },
  })

  const expires = new Date(Date.now() + expiresInSeconds * 1000)
  expiringResponse.headers.set('Expires', expires.toUTCString())
  await cache.put(safeKey(req), expiringResponse)
}

function isExpired(value: Response | undefined) {
  const expires = value?.headers.get('Expires')
  if (expires == undefined) {
    return true
  }
  return new Date(expires) < new Date()
}

export async function getFromWebCache(req: string): Promise<any | undefined> {
  const value = await cache.match(safeKey(req))
  if (isExpired(value)) {
    console.log('Cache expired for:', req)
    return undefined
  }
  return value ? value.json() : undefined
}

export async function clearWebCache(req: string): Promise<void> {
  await cache.delete(safeKey(req))
}

export function saveToCache(key: string, value: any): void {
  cacheSimple.set(key, value)
}

export function getFromCache(key: string): any | undefined {
  return cacheSimple.get(key)
}

export async function webCacheWrapper<T>(
  url: string,
  expiresInSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await getFromWebCache(url) as T | undefined
  if (cached !== undefined) {
    console.log('Returning cached value', url)
    return cached
  }
  const result = await fn()
  console.log('Updating cache', url)
  await saveToWebCache(url, result, expiresInSeconds)
  return result
}
