import { PropsWithChildren } from 'hono/jsx'
import { BusTimes } from './schemas/Bus.ts'

export function NextBusCard({ lastUpdated, nextBusTo, nextBusFrom }: PropsWithChildren<BusTimes>) {
	return (
		<div id='travel-bus'>
			<h2 class='title has-text-primary-15'>Bus Departures</h2>
			<div class='card'>
				<div class='card-content'>
					<p class='content'>
						Last updated: <strong>{lastUpdated}</strong>
					</p>
					<div class='content has-text-centered'>
						<p>
							Next Bus to Malton is <strong>{nextBusTo}</strong> <br />
							Next Bus from Malton is <strong>{nextBusFrom}</strong>
						</p>
						<p>
							Check the{' '}
							<a
								href='https://getdown.org.uk/bus/bus/194.shtml'
								target='_blank'
							>
								schedule
							</a>{' '}
							for more details
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
