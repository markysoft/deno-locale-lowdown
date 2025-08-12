/* eslint-disable @typescript-eslint/no-explicit-any */

import { getFromCache, saveToCache } from './cache.ts'

export class StreamManager {
	startStream(name: string, id: number) {
		saveToCache(`stream:${name}`, id)
		console.log(`Stream started: ${name} with ID ${id}`)
	}

	stopStream(name: string) {
		saveToCache(`stream:${name}`, 0)
	}

	streamIsActive(name: string, id: number): boolean {
		console.log(`Checking if stream ${name} with ID ${id} is active`)
		console.log(`Current value:`, getFromCache(`stream:${name}`))
		return getFromCache(`stream:${name}`) === id
	}
}
