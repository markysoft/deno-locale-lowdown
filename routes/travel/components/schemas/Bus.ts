import { z } from 'zod'
import { applyBritishSummerTime, toHourMinuteString } from '@/lib/utils.ts'

export const BusTimesSchema = z.object({
	lastUpdated: z.coerce.date().transform((date) => toHourMinuteString(applyBritishSummerTime(date))),
	nextBusTo: z.string(),
	nextBusFrom: z.string(),
})

export type BusTimes = z.infer<typeof BusTimesSchema>
