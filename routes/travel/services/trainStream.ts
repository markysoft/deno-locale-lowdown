import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
//import { waitOrInterrupt } from '../../../lib/waitOrInterrupt.ts'
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

  const streamConf = { controller: new AbortController() }

  async function startKvWatcher(kv: Deno.Kv, key: string[]) {
    const changes = kv.watch([key])
    for await (const change of changes) {
      console.log('**************KV Change:', change)
      const value = change[0].value
      if (value) {
        const sessionData = KvSessionSchema.parse(value)
        console.log('Session data:', sessionData)
        if (sessionData.streaming === false) {
          break
        }
      }
      streamConf.controller.abort() // abort any existing wait
    }
    console.log('**************KV Watcher Stopped:', trainSignals.sessionId)
  }


  startKvWatcher(kv, [trainSignals.sessionId])
  return streamSSE(
    c,
    async (stream) => {
      let id = 0
      let isRunning = true

      stream.onAbort(async () => {
        console.log('Stream aborted!')
        isRunning = false
        //controller.abort()
        await kv.set([trainSignals.sessionId], { station: trainSignals.station, streaming: false })
      })

      while (isRunning) {
        const { value } = await kv.get([trainSignals.sessionId])
        trainSignals.station = value ? KvSessionSchema.parse(value).station : trainSignals.station
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
