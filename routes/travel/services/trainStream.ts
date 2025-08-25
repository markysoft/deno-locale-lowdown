import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { updateTrainDepartures } from './updateTrainDepartures.tsx'
import { KvSessionSchema, TrainSignals } from '../components/schemas/TrainRequest.ts'
import { serviceBus } from '../../../lib/serviceBus.ts'

export async function trainStream(
  c: Context,
  kv: Deno.Kv,
  trainSignals: TrainSignals,
  intervalSeconds: number = 10,
) {
  const { value } = await kv.get([trainSignals.sessionId])
  trainSignals.station = value ? KvSessionSchema.parse(value).station : trainSignals.station

  let waitController = new AbortController()

  serviceBus.subscribe(trainSignals.sessionId, (msg) => {
    if (trainSignals.station !== msg.station) {
      trainSignals.station = msg.station
      console.log(`Station changed to ${trainSignals.station}, cancel wait`)
      waitController.abort() // abort any existing wait
    }
  })

  return streamSSE(
    c,
    async (stream) => {
      let id = 0
      let isRunning = true

      stream.onAbort(async () => {
        console.log('Stream aborted', trainSignals.sessionId, trainSignals.station)
        isRunning = false
        await kv.set(['streaming', trainSignals.sessionId], {
          streaming: false,
          item: { station: trainSignals.station },
        })
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
        await waitOrInterrupt(intervalSeconds * 1000, waitController.signal)
        if (waitController.signal.aborted) {
          console.log('aborted')
          waitController = new AbortController()
        } else {
          console.log('woke up')
        }
      }
    },
    (err, stream) => {
      stream.writeln('An error occurred!')
      console.error('stream error', err)
      return Promise.resolve()
    },
  )
}
function waitOrInterrupt(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const onAbort = () => {
      console.log('Aborted from event!')
      clearTimeout(timer)
      return resolve()
    }
    signal.addEventListener('abort', onAbort)

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
  })
}
