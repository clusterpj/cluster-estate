import { Database } from './database.types'

// Define the valid status values
export const PROPERTY_STATUSES = ['available', 'sold', 'pending', 'rented'] as const
export type PropertyStatus = typeof PROPERTY_STATUSES[number]

// Base type from Supabase
export type Property = Database['public']['Tables']['properties']['Row']

// Type guard to check if a status is valid
export function isValidPropertyStatus(status: string): status is PropertyStatus {
  return PROPERTY_STATUSES.includes(status as PropertyStatus)
}