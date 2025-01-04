import { Database } from './database.types'

// Define the valid status values
export const PROPERTY_STATUSES = ['available', 'sold', 'pending', 'rented'] as const
export type PropertyStatus = typeof PROPERTY_STATUSES[number]

// Extended type with all fields
export type Property = Database['public']['Tables']['properties']['Row'] & {
  minimum_rental_period?: number | null
  deposit_amount?: number | null
  available_from?: string | null
  available_to?: string | null
  rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
}

// Type guard to check if a status is valid
export function isValidPropertyStatus(status: string): status is PropertyStatus {
  return PROPERTY_STATUSES.includes(status as PropertyStatus)
}
