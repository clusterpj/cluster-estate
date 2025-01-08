import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
