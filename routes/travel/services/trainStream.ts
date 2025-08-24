import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { updateTrainDepartures } from './updateTrainDepartures.tsx'
import { KvSessionSchema, TrainSignals } from '../components/schemas/TrainRequest.ts'
import { serviceBus } from '../../../lib/serviceBus.ts'
import { StreamingKeySchema } from '../../../lib/kvBus.ts'

export async function trainStream(
  c: Context,
  kv: Deno.Kv,
  trainSignals: TrainSignals,
  intervalSeconds: number = 10,
) {
  const { value } = await kv.get([trainSignals.sessionId])
  trainSignals.station = value ? KvSessionSchema.parse(value).station : trainSignals.station

  const streamConf = { controller: new AbortController() }


   serviceBus.subscribe(trainSignals.sessionId, (msg) => {
     console.log('************** Abort Controller:', msg)
     streamConf.controller.abort() // abort any existing wait
   })

  return streamSSE(
    c,
    async (stream) => {
      let id = 0
      let isRunning = true

      stream.onAbort(async () => {
        console.log('Stream aborted!')
        isRunning = false
        await kv.set(['streaming', trainSignals.sessionId], { streaming: false, item: { station: trainSignals.station } })
      })

      while (isRunning) {
        const { value } = await kv.get(["streaming", trainSignals.sessionId])
        const streamingKey = value ? StreamingKeySchema.parse(value) : null
        console.log('++++++++++ Streaming Key from KV:', streamingKey)
        trainSignals.station = streamingKey ? streamingKey.item.station : trainSignals.station
        let element = await updateTrainDepartures(trainSignals)
        // Sanitize: replace newline followed by whitespace with semicolon to stop it breaking the html
        element = element.replace(/\n\s+/g, ';')
        await stream.writeSSE({
          data: 'elements ' + element,
          event: 'datastar-patch-elements',
          id: String(id++),
        })
        console.log('sleeping')
        await waitOrInterrupt(intervalSeconds * 1000, streamConf.controller.signal)
        if (streamConf.controller.signal.aborted) {
          console.log('aborted')
          streamConf.controller = new AbortController()
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
    if (signal.aborted) {
      console.log('Aborted already!')
      return resolve()
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      console.log('Aborted from event!')
      clearTimeout(timer)
      resolve()
    })
  })
}
