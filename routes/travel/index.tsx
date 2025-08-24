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
  const { value } = await kv.get([trainSignals.sessionId])
  trainSignals.station = value ? KvSessionSchema.parse(value).station : trainSignals.station

  serviceBus.subscribe(trainSignals.sessionId, (msg) => {
    trainSignals.station = msg.station
  })

  return await streamWrapper(
    c,
    () => updateTrainDepartures(trainSignals),
    trainSignals.sessionId,
    oneMinuteInSeconds,
    60,
  )
})

app.post('/train', async (c) => {
  const { station, sessionId } = await c.req.json()
  await kv.set([sessionId], { station })
  console.log(`Switching station to ${station} for session ${sessionId}`)
  serviceBus.publish(sessionId, { station })
  return c.json({ station, sessionId })
})

export default app
