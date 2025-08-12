import { Hono } from 'hono'
import { getBankHolidays } from './services/getBankHolidays.ts'
import { twentyFourHoursInSeconds } from '@/constants.ts'
import { BankHolidayCard } from './components/BankHolidayCard.tsx'
import { BankHolidayList } from './components/BankHolidayList.tsx'
import { cacheWrapper } from '@/lib/cache.ts'
import { BankHoliday } from './schemas/BankHoliday.ts'

const app = new Hono()

app.get('/next', async (c) => {
	c.header('Cache-Control', `public, max-age=${twentyFourHoursInSeconds}`)
	const holidays = await cacheWrapper<BankHoliday[]>(
		'bank-holidays',
		twentyFourHoursInSeconds,
		() => getBankHolidays(),
	)
	return c.html(
		<div id='bank-holidays-next'>
			<BankHolidayCard bankHoliday={holidays[0]} />
		</div>,
	)
})

app.get('/upcoming', async (c) => {
	c.header('Cache-Control', `public, max-age=${twentyFourHoursInSeconds}`)
	const holidays = await cacheWrapper<BankHoliday[]>(
		'bank-holidays',
		twentyFourHoursInSeconds,
		() => getBankHolidays(),
	)
	return c.html(<BankHolidayList bankHolidays={holidays} />)
})

export default app
