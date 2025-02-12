"use client"

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { getBookedDates, calculateTotalPrice } from '@/lib/utils'
import { Property } from '@/types/property'
import { isSameDay, isAfter, isBefore } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false)

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

  const isDateBooked = (date: Date) => {
    // Check if the date is in any booked range
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date))
  }

  const hasBookedDatesInRange = (start: Date, end: Date) => {
    // Check if any date in the range is booked
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

    if (isSelectingCheckOut && selectedDates.start) {
      // When selecting checkout date, disable dates before check-in
      if (isBefore(date, selectedDates.start)) {
        return true
      }
    }

    return (
      date < now ||
      (availableFrom && date < availableFrom) ||
      (availableTo && date > availableTo) ||
      isDateBooked(date)
    )
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    if (!selectedDates.start || !isSelectingCheckOut) {
      // Selecting check-in date
      onDateSelect?.(date)
      setIsSelectingCheckOut(true)
    } else {
      // Selecting check-out date
      if (isAfter(date, selectedDates.start)) {
        // Check for booked dates in range before allowing selection
        if (!hasBookedDatesInRange(selectedDates.start, date)) {
          onDateSelect?.(date)
          setIsSelectingCheckOut(false)
        }
      } else {
        // If selected date is before check-in, make it the new check-in
        onDateSelect?.(date)
        setIsSelectingCheckOut(true)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Check-in Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-14",
                !selectedDates.start && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Check-in</span>
                <span>{selectedDates.start ? format(selectedDates.start, "MMM d, yyyy") : "Select date"}</span>
                {selectedDates.start && (
                  <span className="text-xs text-muted-foreground">
                    3:00 PM
                  </span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDates.start || undefined}
              onSelect={(date) => {
                setIsSelectingCheckOut(false)
                handleDateSelect(date)
              }}
              disabled={(date) => isDateDisabled(date)}
              initialFocus
              fixedWeeks
            />
          </PopoverContent>
        </Popover>

        {/* Check-out Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-14",
                !selectedDates.end && "text-muted-foreground"
              )}
              onClick={() => setIsSelectingCheckOut(true)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Check-out</span>
                <span>{selectedDates.end ? format(selectedDates.end, "MMM d, yyyy") : "Select date"}</span>
                {selectedDates.end && (
                  <span className="text-xs text-muted-foreground">
                    11:00 AM
                  </span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDates.end || undefined}
              onSelect={(date) => {
                setIsSelectingCheckOut(true)
                handleDateSelect(date)
              }}
              disabled={(date) => isDateDisabled(date)}
              initialFocus
              fixedWeeks
              modifiers={
                selectedDates.start ? {
                  selected: [selectedDates.start]
                } : undefined
              }
              modifiersStyles={{
                selected: {
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedDates.start && selectedDates.end && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="font-medium">
              {Math.ceil(
                (selectedDates.end.getTime() - selectedDates.start.getTime()) /
                (1000 * 60 * 60 * 24)
              )} nights
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(
                calculateTotalPrice({
                  checkIn: selectedDates.start,
                  checkOut: selectedDates.end,
                  rentalPrice: property.rental_price || 0,
                  rentalFrequency: 'daily'
                })
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
