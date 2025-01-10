import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { getBookedDates } from '@/lib/utils'
import { Property } from '@/types/property'
import { addDays, isSameDay } from 'date-fns'

interface PropertyCalendarProps {
  property: Property
  onDateSelect?: (date: Date) => void
  selectedDates?: { start?: Date; end?: Date }
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
    if (isDateBooked(date)) {
      return 'bg-destructive/10 text-destructive-foreground hover:bg-destructive/20'
    }
    if (selectedDates?.start && isSameDay(date, selectedDates.start)) {
      return 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
    if (selectedDates?.end && isSameDay(date, selectedDates.end)) {
      return 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
    return ''
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDates?.start}
        onSelect={onDateSelect}
        disabled={isDateDisabled}
        className="rounded-md border"
        classNames={{
          day: getDateClassName,
        }}
        initialFocus
      />
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-destructive/10" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-muted" />
          <span>Available</span>
        </div>
      </div>
    </div>
  )
}
