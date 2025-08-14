import { Hono } from 'hono'
import { NextBusCard } from './components/NextBusCard.tsx'
import { getNextBusFromMalton, getNextBusToMalton } from './services/getNextBus.ts'
import { getAppSettings } from '@/appSettings.ts'
import { Departures, getDepartures } from './services/trainTimes.ts'
import { TrainDeparturesList } from './components/TrainDeparturesList.tsx'
import { streamWrapper } from '@/lib/streamWrapper.ts'
import { oneMinuteInSeconds } from '@/constants.ts'
import { cacheWrapper } from '@/lib/cache.ts'

import { z } from 'zod'

export const TrainRequestSchema = z.object({
	station: z.string(),
})

const app = new Hono()

app.get('/bus', async (c) => {
	const travelSettings = getAppSettings().travel

	const updateBusTimes = () => {
		const now = new Date()
		const nextBusFrom = getNextBusFromMalton(
			now,
			travelSettings.townBusStop,
		)
		const nextBusTo = getNextBusToMalton(now, travelSettings.homeBusStop)
		const htmlString = (<NextBusCard nextBusFrom={nextBusFrom} nextBusTo={nextBusTo} />)
			.toString()
		return Promise.resolve(htmlString)
	}

	return await streamWrapper(c, updateBusTimes, oneMinuteInSeconds, 60)
})

app.get('/train', async (c) => {
	const { station } = TrainRequestSchema.parse(c.get('signals'))
	console.log(`Fetching train departures for station: ${station}`)
	const travelSettings = getAppSettings().travel

	const updateTrainDepartures = async () => {
		const departures = await cacheWrapper<Departures>(
			`train-${station}`,
			oneMinuteInSeconds - 10,
			() => getDepartures(station, travelSettings.railApiKey),
		)
		const htmlString = (<TrainDeparturesList departures={departures} />)
			.toString()
		return htmlString
	}

	return await streamWrapper(c, updateTrainDepartures, oneMinuteInSeconds, 60)
})

export default app
