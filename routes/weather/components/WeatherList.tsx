// deno-lint-ignore-file
import { WeekAheadDay } from '../schemas/Weather.ts'
import { WeatherCard } from './WeatherCard.tsx'

export function WeatherList({ weekAhead }: { weekAhead: WeekAheadDay[] }) {
  return (
    <div id='weather-week-ahead'>
      {weekAhead.map((weekAheadDay: WeekAheadDay) => <WeatherCard weekAheadDay={weekAheadDay} />)}
    </div>
  )
}
