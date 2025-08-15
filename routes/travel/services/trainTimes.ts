import { clearWebCache, getFromWebCache, saveToWebCache } from '@/lib/cache.ts'
import { Departures, DeparturesSchema } from '../components/schemas/Train.ts'

const urlPrefix = 'https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepartureBoard/'

function getUrl(stationCode: string): string {
  return `${urlPrefix}${stationCode}`
}

export async function getDepartures(stationCode: string, apiKey: string): Promise<Departures> {
  let jsonVal = await getFromWebCache(getUrl(stationCode))
  if (jsonVal == undefined) {
    console.log('************** cache expired ***********')
    const result = await fetch(
      getUrl(stationCode),
      { headers: { 'x-apikey': apiKey } },
    )
    jsonVal = await result.json()
    await saveToWebCache(getUrl(stationCode), jsonVal, 1)

    //const cacheVal = await getFromWebCache(getUrl(stationCode))
    //console.log('Cached value after:', cacheVal)
  }

  return DeparturesSchema.parse(jsonVal)
}
