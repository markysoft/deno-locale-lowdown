import { z } from 'zod'
import { applyBritishSummerTime, toHourMinuteString } from '@/lib/utils.ts'

export const DepartureSchema = z.object({
	futureCancellation: z.boolean(),
	futureDelay: z.boolean(),
	origin: z.array(
		z.object({
			locationName: z.string(),
			crs: z.string(),
			assocIsCancelled: z.boolean(),
		}),
	),
	destination: z.array(
		z.object({
			locationName: z.string(),
			crs: z.string(),
			assocIsCancelled: z.boolean(),
		}),
	),
	std: z.string(),
	etd: z.string(),
	platform: z.string().optional().default('TBA'),
	operator: z.string(),
	isCancelled: z.boolean(),
	isReverseFormation: z.boolean(),
	serviceID: z.string(),
}).transform((departure) => {
	return {
		origin: departure.origin[0].locationName,
		destination: departure.destination[0].locationName,
		standardTime: departure.std,
		expected: departure.etd,
		platform: departure.platform,
		operator: departure.operator,
		isCancelled: departure.isCancelled,
		isReverseFormation: departure.isReverseFormation,
	}
})

export const DeparturesSchema = z.object({
	trainServices: z.array(DepartureSchema),
	generatedAt: z.coerce.date().transform((date) => toHourMinuteString(applyBritishSummerTime(date))),
	locationName: z.string(),
	crs: z.string(),
	filterType: z.string(),
	platformAvailable: z.boolean(),
	areServicesAvailable: z.boolean(),
})

export type Departure = z.infer<typeof DepartureSchema>
export type Departures = z.infer<typeof DeparturesSchema>
