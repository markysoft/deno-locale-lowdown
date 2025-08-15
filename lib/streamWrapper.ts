import { Context } from 'hono'
import { stream, streamSSE } from 'hono/streaming'
import { StreamingApi } from 'hono/utils/stream'

export function streamWrapper(
	c: Context,
	asyncFunction: () => Promise<string>,
	intervalSeconds: number = 10,
	maxEvents: number = 30,
) {
	return streamSSE(
		c,
		async (stream) => {
			let id = 0
			let counter = 0
			let isRunning = true

			stream.onAbort(() => {
				console.log('Stream aborted!')
				isRunning = false
			})

			while (isRunning && counter < maxEvents) {
				counter++
				let element = await asyncFunction()
				// Sanitize: replace newline followed by whitespace with semicolon to stop it breaking hte html
				element = element.replace(/\n\s+/g, ';')
				console.log(`Sending event ${counter}`)
				await stream.writeSSE({
					data: 'elements ' + element,
					event: 'datastar-patch-elements',
					id: String(id++),
				})
				console.log('sleeping for ' + intervalSeconds + ' seconds')
				await stream.sleep(intervalSeconds * 1000)
				console.log('woke up after ' + intervalSeconds + ' seconds')
			}
			console.log(`Stream ended after ${counter} events.`)
		},
		(err, stream) => {
			stream.writeln('An error occurred!')
			console.error('stream error', err)
			return Promise.resolve()
		},
	)
}

export function streamWrapper2(
	name: string,
	c: Context,
	asyncFunction: (stream: StreamingApi) => Promise<void>,
	intervalSeconds: number = 60,
	maxEvents: number = 60,
) {
	return stream(
		c,
		async (stream) => {
			let isAborted = false

			stream.onAbort(() => {
				console.log('Stream aborted!')
				isAborted = true
			})

			let counter = 0
			while (!isAborted && counter < maxEvents) {
				try {
					if (!isAborted) {
						counter++
						await asyncFunction(stream)
					}
					//await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
					console.log('sleeping for ' + intervalSeconds + ' seconds')
					await stream.sleep(intervalSeconds * 1000) // Sleep for the specified interval
					console.log('woke up after ' + intervalSeconds + ' seconds')
				} catch (error) {
					console.error('Error in streamWrapper:', error)
					isAborted = true
				}
			}
			console.log(`Stream ${name} ended after ${counter} events.`)
		},
		(err, stream) => {
			stream.writeln('An error occurred!')
			console.error(err)
			return Promise.resolve()
		},
	)
}
