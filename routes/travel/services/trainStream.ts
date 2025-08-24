import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { waitOrInterrupt } from '../../../lib/waitOrInterrupt.ts'
import { updateTrainDepartures } from './updateTrainDepartures.tsx'
import { KvSessionSchema, TrainSignals } from '../components/schemas/TrainRequest.ts'
import { watchKvChanges } from './watchKVChanges.ts'

export async function trainStream(
  c: Context,
  kv: Deno.Kv,
  trainSignals: TrainSignals,
  intervalSeconds: number = 10,
) {

  const { value } = await kv.get([trainSignals.sessionId])
  trainSignals.station = value ? KvSessionSchema.parse(value).station : trainSignals.station

  const controller = new AbortController()
  watchKvChanges(kv, trainSignals, controller.signal)

  return streamSSE(
    c,
    async (stream) => {
      let id = 0
      let isRunning = true

      stream.onAbort(async () => {
        console.log('Stream aborted!')
        isRunning = false
        controller.abort()
        await kv.delete([trainSignals.sessionId])
      })

      while (isRunning) {
        let element = await updateTrainDepartures(trainSignals)
        // Sanitize: replace newline followed by whitespace with semicolon to stop it breaking the html
        element = element.replace(/\n\s+/g, ';')
        await stream.writeSSE({
          data: 'elements ' + element,
          event: 'datastar-patch-elements',
          id: String(id++),
        })
        console.log('sleeping')
        await waitOrInterrupt(intervalSeconds * 1000, trainSignals.sessionId)
        console.log('woke up')
      }
    },
    (err, stream) => {
      stream.writeln('An error occurred!')
      console.error('stream error', err)
      return Promise.resolve()
    },
  )
}
