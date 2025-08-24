import { TrainSignals } from '../components/schemas/TrainRequest.ts'

export async function watchKvChanges(kv: Deno.Kv, trainSignals: TrainSignals, abortSignal: AbortSignal) {
  const changes = kv.watch([[trainSignals.sessionId]])

  for await (const change of changes) {
    console.log('**************KV Change:', change)
    if (abortSignal.aborted) break
  }

  console.log('**************KV Watcher Stopped:', trainSignals.sessionId)
}
