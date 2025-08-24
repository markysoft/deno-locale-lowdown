import { serviceBus } from './serviceBus.ts'

export function waitOrInterrupt(ms: number, sessionId: string): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      serviceBus.unsubscribe(sessionId, handler)
      resolve()
    }, ms)

    const handler = () => {
      clearTimeout(timer)
      serviceBus.unsubscribe(sessionId, handler)
      resolve()
    }

    serviceBus.subscribe(sessionId, handler)
  })
}
