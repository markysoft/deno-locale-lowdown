import { z } from 'zod'

const AppSettingsSchema = z.object({
	travel: z.object({
		homeBusStop: z.string().default('Barton le Street'),
		townBusStop: z.string().default('MALTON Bus Station'),
		railApiKey: z.string(),
	}),
	weather: z.object({
		apiKey: z.string().optional(),
		metOfficeApiKey: z.string().optional(), // Optional for compatibility with existing code, but should be set in production
	}),
	tide: z.object({
		location: z.string().default('whitby'),
	}),
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

let appSettings: AppSettings | undefined

export function getAppSettings(): AppSettings {
	if (appSettings === undefined) {
		appSettings = AppSettingsSchema.parse({
			travel: {
				homeBusStop: Deno.env.get('SPIN_VARIABLE_HOME_BUS_STOP'),
				townBusStop: Deno.env.get('SPIN_VARIABLE_TOWN_BUS_STOP'),
				railApiKey: Deno.env.get('SPIN_VARIABLE_RAIL_API_KEY'),
			},
			weather: {
				apiKey: Deno.env.get('SPIN_VARIABLE_OPEN_WEATHER_API_KEY'),
				metOfficeApiKey: Deno.env.get(
					'SPIN_VARIABLE_MET_OFFICE_API_KEY',
				),
			},
			tide: {
				location: Deno.env.get('SPIN_VARIABLE_TIDE_LOCATION'),
			},
		})
	}
	return appSettings
}
