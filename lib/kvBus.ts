import { z } from 'zod'
import { serviceBus } from './serviceBus.ts'
// deno-lint-ignore-file no-explicit-any

export const StreamingKeySchema = z.object({
  streaming: z.boolean(),
  item: z.any(),
})

export type StreamingKey = z.infer<typeof StreamingKeySchema>

export async function startKvWatcher(kv: Deno.Kv, key: string) {

  console.log('++++ KV Bus Started for', key)
  const changes = kv.watch([["streaming", key]])

  for await (const change of changes) {
    const value = change[0].value
    if (value) {
      const sessionData = StreamingKeySchema.parse(value)
      console.log('++++ publishing on service bus', sessionData)
      serviceBus.publish(key, sessionData.item)
      if (sessionData.streaming === false) {
        break
      }
    }
  }
  console.log('++++ KV Bus Stopped for', key)
}
