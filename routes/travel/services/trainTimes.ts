import { Departures, DeparturesSchema } from '../components/schemas/Train.ts'

const urlPrefix = 'https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepartureBoard/'

function getUrl(stationCode: string): string {
  return `${urlPrefix}${stationCode}`
}

export async function getDepartures(stationCode: string, apiKey: string): Promise<Departures> {
  const result = await fetch(
    getUrl(stationCode),
    {
      headers: {
        'x-apikey': apiKey,
      },
    },
  )
  return DeparturesSchema.parse(await result.json())
}
