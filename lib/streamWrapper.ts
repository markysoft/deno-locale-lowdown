import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { waitOrInterrupt } from './waitOrInterrupt.ts'

export function streamWrapper(
  c: Context,
  asyncFunction: () => Promise<string>,
  sessionId: string,
  intervalSeconds: number = 10,
  maxEvents: number = 30,
) {
  return streamSSE(
    c,
    async (stream) => {
      let id = 0
      let counter = 0
      let isRunning = true

      stream.onAbort(() => {
        console.log('Stream aborted!')
        isRunning = false
      })

      while (isRunning && counter < maxEvents) {
        counter++
        let element = await asyncFunction()
        // Sanitize: replace newline followed by whitespace with semicolon to stop it breaking the html
        element = element.replace(/\n\s+/g, ';')
        console.log(`Sending event ${counter}`)
        await stream.writeSSE({
          data: 'elements ' + element,
          event: 'datastar-patch-elements',
          id: String(id++),
        })
        console.log('sleeping')
        await waitOrInterrupt(intervalSeconds * 1000, sessionId)
        console.log('woke up')
      }
      console.log(`Stream ended after ${counter} events.`)
    },
    (err, stream) => {
      stream.writeln('An error occurred!')
      console.error('stream error', err)
      return Promise.resolve()
    },
  )
}
