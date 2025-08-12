// deno-lint-ignore-file jsx-key
import { BankHoliday } from '../schemas/BankHoliday.ts'
import { BankHolidayCard } from './BankHolidayCard.tsx'

export function BankHolidayList({ bankHolidays }: { bankHolidays: BankHoliday[] }) {
    return (
        < div id="bank-holidays-upcoming" >
            {bankHolidays.map((bankHoliday: BankHoliday) => <BankHolidayCard bankHoliday={bankHoliday} />)}
        </ div>
    )
}
