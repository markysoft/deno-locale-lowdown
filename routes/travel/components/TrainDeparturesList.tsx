import { Departure, Departures } from './schemas/Train.ts'
import { TrainDepartureCard } from './TrainDepartureCard.tsx'

export function TrainDeparturesList({ departures }: { departures: Departures }) {
  const stationList = [
    { name: 'Malton', crs: 'MLT' },
    { name: "Scarbo'", crs: 'SCA' },
    { name: 'York', crs: 'YRK' },
    { name: 'Leeds', crs: 'LDS' },
  ]
  const isActive = (crs: string) => {
    return departures.crs === crs ? 'is-active' : ''
  }

  const showPlatforms = (): boolean => {
    return departures.crs !== 'MLT'
  }

  return (
    <div id='train-departures'>
      <h2 class='title has-text-primary-15'>Trains</h2>

      <div class='card'>
        <header class='card-header'>
          <div class='tabs'>
            <ul style={{ 'margin-inline-start': '0em' }}>
              {stationList.map((station) => (
                <li
                  class={isActive(station.crs)}
                  key={station.crs}
                >
                  <a
                    aria-label={`get ${station.name} train times`}
                    data-on-click={`$station='${station.crs}';@post('/travel/train')`} 
                  >
                    {station.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>
        <div class='card-content'>
          <p class='content'>
            Last updated: <strong>{departures.generatedAt}</strong>
          </p>
          {departures.trainServices.map(
            (service: Departure, index: number) => {
              return (
                <>
                  <TrainDepartureCard
                    service={service}
                    showPlatforms={showPlatforms()}
                  />
                  {index <
                      departures.trainServices.length -
                        1 && <hr />}
                </>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}
