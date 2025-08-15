// deno-lint-ignore-file no-unused-vars
import { Context } from 'hono'

export function readSignals(c: Context): Record<string, unknown> {
  try {
    if (c.req.header('Datastar-Request') === 'true') {
      const datastarParam = c.req.method === 'GET' ? c.req.query('datastar') : undefined
      return datastarParam ? JSON.parse(datastarParam) : {}
    }
  } catch (err: unknown) {
    // ignore
  }
  return {}
}

export async function datastarMiddleware(c: Context, next: () => Promise<void>) {
  const isDatastar = c.req.header('Datastar-Request') === 'true'
  c.set('signals', readSignals(c))
  await next()
}

// Extend the context type
declare module 'hono' {
  interface ContextVariableMap {
    signals: Record<string, unknown>
  }
}
