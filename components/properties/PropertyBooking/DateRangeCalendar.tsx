'use client'

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { getBookedDates } from '@/lib/utils'
import { Property } from '@/types/property'
import { isSameDay } from 'date-fns'
import { DateRange } from 'react-day-picker'

interface DateRangeCalendarProps {
  property: Property
  onRangeSelect: (range: { checkIn: Date; checkOut: Date }) => void
  selected?: DateRange
}

export function DateRangeCalendar({ property, onRangeSelect, selected }: DateRangeCalendarProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(selected)

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const dates = await getBookedDates(property.id)
        setBookedDates(dates)
      } catch (error) {
        console.error('Failed to fetch booked dates:', error)
      }
    }

    fetchBookedDates()
  }, [property.id])

  useEffect(() => {
    setDateRange(selected)
  }, [selected])

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date))
  }

  const hasBookedDatesInRange = (start: Date, end: Date) => {
    const current = new Date(start)
    while (current <= end) {
      if (isDateBooked(current)) {
        return true
      }
      current.setDate(current.getDate() + 1)
    }
    return false
  }

  const isDateDisabled = (date: Date) => {
    const now = new Date()
    const availableFrom = property.available_from ? new Date(property.available_from) : null
    const availableTo = property.available_to ? new Date(property.available_to) : null

    if (dateRange?.from && !dateRange.to) {
      if (date < dateRange.from) return true
      if (hasBookedDatesInRange(dateRange.from, date)) return true
    }

    return (
      date < now ||
      (availableFrom && date < availableFrom) ||
      (availableTo && date > availableTo) ||
      isDateBooked(date)
    )
  }

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)

    if (range?.from && range?.to) {
      onRangeSelect({
        checkIn: range.from,
        checkOut: range.to
      })
    }
  }

  return (
    <Calendar
      mode="range"
      selected={dateRange}
      onSelect={handleSelect}
      disabled={isDateDisabled}
      numberOfMonths={1}
      defaultMonth={new Date()}
      fixedWeeks
      showOutsideDays={false}
      modifiersClassNames={{
        selected: "bg-primary text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_start: "!rounded-r-none",
        range_end: "!rounded-l-none",
        range_middle: "!rounded-none bg-accent/50"
      }}
      className="rounded-md border bg-white"
    />
  )
}