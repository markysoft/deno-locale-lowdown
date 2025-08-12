import { Hono } from 'hono'
import { getNextFourBinDays } from './services/getNextBinDays.ts'
import { BinsCard } from './components/BinsCard.tsx'

const app = new Hono()

app.get('/', (c) => {
	const nextBins = getNextFourBinDays(new Date())
	return c.html(<BinsCard nextBins={nextBins} />)
})

export default app
