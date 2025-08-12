import { Hono } from 'hono'
import { cacheWrapper } from '@/lib/cache.ts'
import { oneHourInSeconds } from '@/constants.ts'
import { getTodayWeather, getWeekWeather } from './services/getOpenWeather.ts'
import { WeekAheadDay } from './schemas/Weather.ts'
import { WeatherCard } from './components/WeatherCard.tsx'
import { WeatherList } from './components/WeatherList.tsx'

const app = new Hono()

app.get('/today', async (c) => {
    c.header('Cache-Control', `public, max-age=${oneHourInSeconds}`)
    const weekAheadDay = await cacheWrapper<WeekAheadDay>('weather-day', oneHourInSeconds, () => getTodayWeather())
    return c.html(<div id='weather-today'><WeatherCard weekAheadDay={weekAheadDay} /></div>)
})

app.get('/week-ahead', async (c) => {
    c.header('Cache-Control', `public, max-age=${oneHourInSeconds}`)
    const weekAhead = await cacheWrapper<WeekAheadDay[]>('weather-week', oneHourInSeconds, () => getWeekWeather())
    return c.html(<WeatherList weekAhead={weekAhead} />)
})

export default app
