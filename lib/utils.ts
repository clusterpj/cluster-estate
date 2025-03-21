import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears } from "date-fns"

import { createClient } from '@/utils/supabase-client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isPropertyAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const supabase = createClient()
  
  // Check if property exists and is available for rent
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) return false
  
  // Check listing type
  if (property.listing_type !== 'rent' && property.listing_type !== 'both') {
    return false
  }

  // Check availability window
  const now = new Date()
  const availableFrom = property.available_from ? new Date(property.available_from) : null
  const availableTo = property.available_to ? new Date(property.available_to) : null

  if (availableFrom && availableFrom > now) return false
  if (availableTo && availableTo < now) return false

  // Check for overlapping bookings
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('property_id', propertyId)
    .or(`and(check_in.lte.${checkOut.toISOString()},check_out.gte.${checkIn.toISOString()})`)
    .neq('status', 'canceled')

  return count === 0
}

export async function getBookedDates(propertyId: string): Promise<Date[]> {
  const supabase = createClient()
  const bookedDates: Date[] = []
  
  // Get dates from bookings table
  const { data: bookings } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('property_id', propertyId)
    .neq('status', 'canceled')

  if (bookings) {
    bookings.forEach(booking => {
      const start = new Date(booking.check_in)
      const end = new Date(booking.check_out)
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d))
      }
    })
  }

  // Get dates from property_availability table (iCal events)
  const { data: availability } = await supabase
    .from('property_availability')
    .select('start_date, end_date')
    .eq('property_id', propertyId)

  if (availability) {
    availability.forEach(period => {
      const start = new Date(period.start_date)
      const end = new Date(period.end_date)
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d))
      }
    })
  }

  // Remove duplicate dates
  return [...new Set(bookedDates.map(date => date.toISOString()))]
    .map(dateStr => new Date(dateStr))
}

interface PriceCalculationParams {
  checkIn: Date
  checkOut: Date
  rentalPrice: number
  rentalFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export function calculateTotalPrice({
  checkIn,
  checkOut,
  rentalPrice,
  rentalFrequency,
}: PriceCalculationParams): number {
  let duration: number
  
  switch (rentalFrequency) {
    case 'daily':
      duration = differenceInDays(checkOut, checkIn)
      break
    case 'weekly':
      duration = differenceInWeeks(checkOut, checkIn)
      break
    case 'monthly':
      duration = differenceInMonths(checkOut, checkIn)
      break
    case 'yearly':
      duration = differenceInYears(checkOut, checkIn)
      break
    default:
      throw new Error('Invalid rental frequency')
  }

  // If duration is less than 1 unit, round up to 1
  duration = Math.max(1, duration)

  // Calculate total price
  const totalPrice = rentalPrice * duration

  // Round to 2 decimal places
  return Math.round(totalPrice * 100) / 100
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getCalendarDateClasses(
  date: Date,
  selectedDates: SelectedDates,
  isDateBooked: (date: Date) => boolean,
  isDateDisabled: (date: Date) => boolean
): string {
  const classes = [
    'h-9',
    'w-9',
    'p-0',
    'font-normal',
    'rounded-md',
    'transition-colors',
    'aria-selected:opacity-100',
    'flex items-center justify-center',
    'text-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-ring',
    'focus:ring-offset-2',
    'hover:bg-accent',
    'hover:text-accent-foreground'
  ]

  // Check if date is in selected range
  if (selectedDates.start && selectedDates.end) {
    const isInRange = isWithinInterval(date, {
      start: selectedDates.start,
      end: selectedDates.end
    })
    
    if (isInRange) {
      classes.push(
        'bg-primary/10',
        'hover:bg-primary/20',
        'dark:bg-primary/20',
        'dark:hover:bg-primary/30'
      )
    }
  }

  // Check if date is selected start/end
  if (selectedDates.start && isSameDay(date, selectedDates.start)) {
    classes.push(
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/90',
      'dark:bg-primary/90',
      'dark:hover:bg-primary/80'
    )
  }
  if (selectedDates.end && isSameDay(date, selectedDates.end)) {
    classes.push(
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/90',
      'dark:bg-primary/90',
      'dark:hover:bg-primary/80'
    )
  }

  // Check if date is booked
  if (isDateBooked(date)) {
    classes.push(
      'bg-destructive/10',
      'text-destructive-foreground',
      'hover:bg-destructive/20',
      'dark:bg-destructive/20',
      'dark:hover:bg-destructive/30'
    )
  }

  // Check if date is available
  if (!isDateDisabled(date) && !isDateBooked(date)) {
    classes.push(
      'hover:bg-accent',
      'hover:text-accent-foreground',
      'dark:hover:bg-accent/50',
      'dark:hover:text-accent-foreground'
    )
  }

  return classes.join(' ')
}
