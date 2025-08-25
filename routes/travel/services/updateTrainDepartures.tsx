import { getAppSettings } from '../../../appSettings.ts'
import { oneMinuteInSeconds } from '../../../constants.ts'
import { webCacheWrapper } from '../../../lib/cache.ts'
import { Departures } from '../components/schemas/Train.ts'
import { TrainSignals } from '../components/schemas/TrainRequest.ts'
import { TrainDeparturesList } from '../components/TrainDeparturesList.tsx'
import { getDepartures } from './trainTimes.ts'

export async function updateTrainDepartures(signals: TrainSignals) {
  const departures = await webCacheWrapper<Departures>(
    `trains-${signals.station}`,
    oneMinuteInSeconds,
    () => getDepartures(signals.station, getAppSettings().travel.railApiKey),
  )
  return (<TrainDeparturesList departures={departures} />).toString()
}
