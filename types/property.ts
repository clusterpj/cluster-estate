import { Database } from './database.types'

export type Property = Database['public']['Tables']['properties']['Row']
export type NewProperty = Database['public']['Tables']['properties']['Insert']
export type UpdateProperty = Database['public']['Tables']['properties']['Update']

export type PropertyStatus = 'available' | 'sold' | 'pending'
export type ListingType = 'sale' | 'rent' | 'both'
export type RentalFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface PropertyFilters {
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  listingType?: ListingType
  status?: PropertyStatus
}

export interface PropertySortOption {
  label: string
  value: string
  sortFn: (a: Property, b: Property) => number
}

export interface PropertyWithAvailability extends Property {
  isAvailable: boolean
  availabilityMessage?: string
}

export function isValidPropertyStatus(status: string): status is PropertyStatus {
  return ['available', 'sold', 'pending'].includes(status)
}

export function isPropertyAvailableForBooking(property: Property): PropertyWithAvailability {
  if (property.listing_type !== 'rent' && property.listing_type !== 'both') {
    return {
      ...property,
      isAvailable: false,
      availabilityMessage: 'This property is not available for rent',
    }
  }

  if (property.status !== 'available') {
    return {
      ...property,
      isAvailable: false,
      availabilityMessage: `This property is currently ${property.status}`,
    }
  }

  const now = new Date()
  const availableFrom = property.available_from ? new Date(property.available_from) : null
  const availableTo = property.available_to ? new Date(property.available_to) : null

  if (availableFrom && availableFrom > now) {
    return {
      ...property,
      isAvailable: false,
      availabilityMessage: `This property will be available from ${availableFrom.toLocaleDateString()}`,
    }
  }

  if (availableTo && availableTo < now) {
    return {
      ...property,
      isAvailable: false,
      availabilityMessage: `This property was available until ${availableTo.toLocaleDateString()}`,
    }
  }

  return {
    ...property,
    isAvailable: true,
  }
}
