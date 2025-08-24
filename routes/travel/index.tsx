import { Hono } from 'hono'

import { NextBusCard } from './components/NextBusCard.tsx'
import { getNextBusFromMalton, getNextBusToMalton } from './services/getNextBus.ts'
import { getAppSettings } from '@/appSettings.ts'
import { streamWrapper } from '@/lib/streamWrapper.ts'
import { oneMinuteInSeconds } from '@/constants.ts'
import { serviceBus } from '@/lib/serviceBus.ts'

import { BusTimesSchema } from './components/schemas/Bus.ts'
import { KvSessionSchema, TrainRequestSchema } from './components/schemas/TrainRequest.ts'
import { updateTrainDepartures } from './services/updateTrainDepartures.tsx'
import { watchKvChanges } from './services/watchKVChanges.ts'
import { trainStream } from './services/trainStream.ts'
import { startKvWatcher, StreamingKeySchema } from '../../lib/kvBus.ts'

const app = new Hono()

const kv = await Deno.openKv()

app.get('/bus', async (c) => {
  const travelSettings = getAppSettings().travel

  const updateBusTimes = () => {
    const now = new Date()
    const nextBusFrom = getNextBusFromMalton(now, travelSettings.townBusStop)
    const nextBusTo = getNextBusToMalton(now, travelSettings.homeBusStop)

    const busTimes = BusTimesSchema.parse({
      lastUpdated: now,
      nextBusFrom,
      nextBusTo,
    })

    const htmlString = (<NextBusCard busTimes={busTimes} />).toString()
    return Promise.resolve(htmlString)
  }

  return await streamWrapper(c, updateBusTimes, 'na', oneMinuteInSeconds, 60)
})

app.get('/train', async (c) => {
  const trainSignals = TrainRequestSchema.parse(c.get('signals'))
  // update from session if set, rather than taking the 'resumed' one
  const { value } = await kv.get(["streaming", trainSignals.sessionId])

  const sessionData = value ? StreamingKeySchema.parse(value) : null
  trainSignals.station = sessionData ? KvSessionSchema.parse(sessionData.item).station : trainSignals.station

  await kv.set(["streaming", trainSignals.sessionId], { item: { station: trainSignals.station }, streaming: true })
  startKvWatcher(kv, trainSignals.sessionId)

  return await trainStream(c, kv, trainSignals, 30)
})

app.post('/train', async (c) => {
  const { station, sessionId } = await c.req.json()
  console.log(`Switching station to ${station} for session ${sessionId}`)
  await kv.set(['streaming', sessionId], { streaming: true, item: { station } })
  return c.json({ station, sessionId })
})

export default app
