import { z } from 'zod'

export const WeatherEntitySchema = z.object({
  id: z.number(),
  main: z.string(),
  description: z.string(),
  icon: z.string(),
})

export const TempSchema = z.object({
  day: z.number(),
  min: z.number(),
  max: z.number(),
  night: z.number(),
  eve: z.number(),
  morn: z.number(),
})

export const FeelsLikeSchema = z.object({
  day: z.number(),
  night: z.number(),
  eve: z.number(),
  morn: z.number(),
})

export const OpenWeatherSchema = z.object({
  dt: z.number(),
  summary: z.string(),
  sunrise: z.number(),
  sunset: z.number(),
  moonrise: z.number(),
  moonset: z.number(),
  moon_phase: z.number(),
  temp: TempSchema,
  feels_like: FeelsLikeSchema,
  pressure: z.number(),
  humidity: z.number(),
  dew_point: z.number(),
  wind_speed: z.number(),
  wind_deg: z.number(),
  wind_gust: z.number(),
  weather: z.array(WeatherEntitySchema),
  clouds: z.number(),
  pop: z.number(),
  uvi: z.number(),
})


export type OpenWeather = z.infer<typeof OpenWeatherSchema>
