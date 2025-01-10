import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { getBookedDates, calculateTotalPrice } from '@/lib/utils'
import { Property } from '@/types/property'
import { isSameDay, isWithinInterval, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface SelectedDates {
  start: Date | null
  end: Date | null
}

interface PropertyCalendarProps {
  property: Property
  onDateSelect?: (date: Date) => void
  selectedDates: SelectedDates
  onClearSelection?: () => void
}

const PRESET_DURATIONS = [
  { label: 'Weekend', days: 2 },
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 }
]

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

  const handlePresetSelection = (days: number) => {
    if (!selectedDates.start) return
    
    const endDate = addDays(selectedDates.start, days - 1)
    if (!isDateDisabled(endDate)) {
      onDateSelect?.(endDate)
    }
  }

  const totalNights = selectedDates.start && selectedDates.end
    ? Math.ceil(
        (selectedDates.end.getTime() - selectedDates.start.getTime()) / 
        (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Date Selection Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Check-in</h3>
            {selectedDates.start && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onClearSelection?.()}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
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
                <span>{selectedDates.start ? format(selectedDates.start, "PPP") : "Select check-in"}</span>
                {selectedDates.start && (
                  <span className="text-xs text-muted-foreground">
                    Check-in: 3:00 PM
                  </span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 border-b">
              <div className="flex gap-2 mb-4">
                {PRESET_DURATIONS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelection(preset.days)}
                    disabled={!selectedDates.start}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Calendar
                mode="single"
                selected={selectedDates.start || undefined}
                onSelect={(date) => date && onDateSelect?.(date)}
                disabled={(date) => isDateDisabled(date)}
                initialFocus
                classNames={{
                  months: 'flex gap-4 sm:gap-8 w-full',
                  month: 'space-y-4 w-full sm:w-[280px]',
                  caption: 'flex justify-center pt-2 relative items-center',
                  caption_label: 'text-sm sm:text-base font-medium text-foreground',
                  nav: 'space-x-1 sm:space-x-2 flex items-center',
                  nav_button: 'h-7 w-7 sm:h-8 sm:w-8 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity rounded-md border border-input hover:bg-accent hover:text-accent-foreground',
                  nav_button_previous: 'absolute left-1 sm:left-2',
                  nav_button_next: 'absolute right-1 sm:right-2',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-1',
                  cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: (date) => getDateClassName(date),
                  day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle: 'aria-selected:bg-accent/50 aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price per night</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(property.rental_price || 0)}
                </span>
              </div>
              {selectedDates.start && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Minimum stay</span>
                  <span className="font-medium">
                    {property.minimum_rental_period || 1} night(s)
                  </span>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-14",
                !selectedDates.end && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span>{selectedDates.end ? format(selectedDates.end, "PPP") : "Select check-out"}</span>
                {selectedDates.end && (
                  <span className="text-xs text-muted-foreground">
                    Check-out: 11:00 AM
                  </span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 border-b">
              <Calendar
                mode="single"
                selected={selectedDates.end || undefined}
                onSelect={(date) => date && onDateSelect?.(date)}
                disabled={(date) => 
                  date <= (selectedDates.start || new Date()) ||
                  isDateDisabled(date)
                }
                initialFocus
                classNames={{
                  months: 'flex gap-4 sm:gap-8 w-full',
                  month: 'space-y-4 w-full sm:w-[280px]',
                  caption: 'flex justify-center pt-2 relative items-center',
                  caption_label: 'text-sm sm:text-base font-medium text-foreground',
                  nav: 'space-x-1 sm:space-x-2 flex items-center',
                  nav_button: 'h-7 w-7 sm:h-8 sm:w-8 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity rounded-md border border-input hover:bg-accent hover:text-accent-foreground',
                  nav_button_previous: 'absolute left-1 sm:left-2',
                  nav_button_next: 'absolute right-1 sm:right-2',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-1',
                  cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: (date) => getDateClassName(date),
                  day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle: 'aria-selected:bg-accent/50 aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total nights</span>
                <span className="font-medium">{totalNights}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total price</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    calculateTotalPrice({
                      checkIn: selectedDates.start || new Date(),
                      checkOut: selectedDates.end || new Date(),
                      rentalPrice: property.rental_price || 0,
                      rentalFrequency: 'daily'
                    })
                  )}
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4">
        {/* Availability Overview */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-semibold text-lg">Availability Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listing Type</span>
              <span className="font-medium capitalize">{property.listing_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available From</span>
              <span className="font-medium">
                {property.available_from ? 
                  format(new Date(property.available_from), "MMM d, yyyy") : 
                  "Immediately"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available To</span>
              <span className="font-medium">
                {property.available_to ? 
                  format(new Date(property.available_to), "MMM d, yyyy") : 
                  "No end date"}
              </span>
            </div>
          </div>
        </div>

        {selectedDates.start && selectedDates.end && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-medium">
                  {format(selectedDates.start, "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {format(selectedDates.end, "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold">Pricing Breakdown</h4>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Nights</p>
                <p className="font-medium">
                  {Math.ceil(
                    (selectedDates.end.getTime() - selectedDates.start.getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Price per night</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(property.rental_price || 0)}
                </p>
              </div>
              <div className="flex justify-between border-t pt-2">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    (property.rental_price || 0) * 
                    Math.ceil(
                      (selectedDates.end.getTime() - selectedDates.start.getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Legend and Policies */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-3">Calendar Legend</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-sm bg-primary" />
                <span className="font-medium">Selected Dates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-sm bg-destructive/10" />
                <span className="font-medium">Unavailable</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-sm bg-muted hover:bg-accent" />
                <span className="font-medium">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-sm bg-accent/50" />
                <span className="font-medium">Within Range</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-3">Cancellation Policy</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Free cancellation up to {property.cancellation_days || 7} days before check-in
              </p>
              <p className="text-muted-foreground">
                50% refund if canceled within {property.cancellation_days || 7} days of check-in
              </p>
              <p className="text-muted-foreground">
                No refund for cancellations after check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
