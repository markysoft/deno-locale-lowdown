import { Departures, DeparturesSchema } from '../components/schemas/Train.ts'

const urlPrefix = 'https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepartureBoard'

const ValidDestinations = ['Scarborough', 'Manchester Piccadilly', 'Leeds', 'Manchester Victoria', 'Malton', 'York']

function getUrl(stationCode: string): string {
  return `${urlPrefix}/${stationCode}?numRows=50`
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
  
  const departures = DeparturesSchema.parse(await result.json())
  departures.trainServices = departures.trainServices?.filter((service) => ValidDestinations.includes(service.destination))
  
  return departures
}
