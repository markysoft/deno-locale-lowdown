import { Hono } from 'hono'
import { cacheWrapper } from '@/lib/cache.ts'
import { TideRecord } from './schemas/Tide.ts'
import { twelveHoursInSeconds } from '@/constants.ts'
import { getTides } from './services/getTides.ts'
import { TidesCard } from './components/TidesCard.tsx'
import { getAppSettings } from '@/appSettings.ts'

const app = new Hono()

app.get('/', async (c) => {
    c.header('Cache-Control', `public, max-age=${twelveHoursInSeconds}`)
    const tideConfig = getAppSettings().tide
    const tideRecord = await cacheWrapper<TideRecord>('tide', twelveHoursInSeconds, () => getTides(tideConfig.location))
    return c.html(<TidesCard tideRecord={tideRecord} />)
})

export default app
