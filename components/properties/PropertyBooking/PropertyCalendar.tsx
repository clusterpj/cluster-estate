import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { getBookedDates } from '@/lib/utils'
import { Property } from '@/types/property'
import { addDays, isSameDay, isWithinInterval } from 'date-fns'

interface SelectedDates {
  start: Date | null
  end: Date | null
}

interface PropertyCalendarProps {
  property: Property
  onDateSelect?: (date: Date) => void
  selectedDates: SelectedDates
}

export function PropertyCalendar({ property, onDateSelect, selectedDates }: PropertyCalendarProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const dates = await getBookedDates(property.id)
        setBookedDates(dates)
      } catch (error) {
        console.error('Failed to fetch booked dates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookedDates()
  }, [property.id])

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date))
  }

  const isDateDisabled = (date: Date) => {
    const now = new Date()
    const availableFrom = property.available_from ? new Date(property.available_from) : null
    const availableTo = property.available_to ? new Date(property.available_to) : null

    return (
      date < now ||
      (availableFrom && date < availableFrom) ||
      (availableTo && date > availableTo) ||
      isDateBooked(date)
    )
  }

  const getDateClassName = (date: Date) => {
    return getCalendarDateClasses(
      date,
      selectedDates,
      isDateBooked,
      isDateDisabled
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <Calendar
          mode="range"
          selected={{
            from: selectedDates?.start,
            to: selectedDates?.end
          }}
          onSelect={(range) => {
            if (range?.from) {
              onDateSelect?.(range.from)
            }
          }}
          disabled={isDateDisabled}
          className="w-full"
          numberOfMonths={2}
          classNames={{
            months: 'flex gap-8 w-full',
            month: 'space-y-4 w-[280px]',
            caption: 'flex justify-center pt-2 relative items-center',
            caption_label: 'text-base font-medium text-foreground',
            nav: 'space-x-2 flex items-center',
            nav_button: 'h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity',
            nav_button_previous: 'absolute left-2',
            nav_button_next: 'absolute right-2',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-1',
            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: (date) => getDateClassName(date),
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground',
            day_outside: 'text-muted-foreground opacity-50',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-accent/50 aria-selected:text-accent-foreground',
            day_hidden: 'invisible',
          }}
          components={{
            IconLeft: () => <span className="h-4 w-4">{"<"}</span>,
            IconRight: () => <span className="h-4 w-4">{">"}</span>,
          }}
          initialFocus
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-primary" />
          <span>Selected Dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-primary/10" />
          <span>Selected Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-destructive/10" />
          <span>Booked/Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-muted hover:bg-accent" />
          <span>Available</span>
        </div>
      </div>
    </div>
  )
}
