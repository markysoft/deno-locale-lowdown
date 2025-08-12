import { Hono } from 'hono'
import { stream, streamSSE, streamText } from 'hono/streaming'
import { logger } from 'hono/logger'
import { timing } from 'hono/timing'
import { jsxRenderer } from 'hono/jsx-renderer'
import home from './routes/home/index.tsx'
import healthz from './routes/healthz.ts'
import bankHolidays from './routes/bank-holidays/index.tsx'
import travel from './routes/travel/index.tsx'
import bins from './routes/bins/index.tsx'
import weather from './routes/weather/index.tsx'
import tides from './routes/tides/index.tsx'
import { streamWrapper } from './lib/streamWrapper.ts'
import { ErrorArticle } from './routes/home/components/ErrorArticle.tsx'

console.log('Starting...')
const app = new Hono()

app.use(logger())
app.use(timing())
app.use(
	'*',
	jsxRenderer(({ children }) => <html>{children}</html>, { docType: true }),
)

app.get('/favicon.ico', (c) => c.body(null, 204))
app.route('/', home)
app.route('/healthz', healthz)
app.route('/bank-holidays', bankHolidays)
app.route('/travel', travel)
app.route('/tides', tides)
app.route('/weather', weather)
app.route('/bins', bins)

app.notFound((c) => c.text('No such route, try another!', 404))

let id = 0

app.get('/sse', async (c) => {
	return streamWrapper(c, async () => {
		const message = `It is ${new Date().toISOString()}`
		return Promise.resolve('<div id="travel-bus">' + message + '</div>')
	})
})

app.get('/sse2', async (c) => {
	return streamSSE(
		c,
		async (stream) => {
			while (true) {
				const message = `It is ${new Date().toISOString()}`
				await stream.writeSSE({
					data: 'elements <div id="travel-bus">' + message + '</div>',
					event: 'datastar-patch-elements',
					id: String(id++),
				})
				await stream.sleep(1000)
			}
		},
		async (err, stream) => {
			stream.writeln('An error occurred!')
			console.error(err)
			return Promise.resolve()
		},
	)
})

app.onError((err: Error, c) => {
	console.error(`${err}`)
	console.error(`${err.stack}`)
	const message = err instanceof Error ? err.message : JSON.stringify(err)
	return c.html(<ErrorArticle message={message} />)
})
Deno.serve({ port: 3000 }, app.fetch)
