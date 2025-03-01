// app/api/properties/availability/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { logger } from '@/lib/logger'

interface AvailabilityRequest {
  startDate: string;
  endDate: string;
  propertyId?: string; // Optional property ID for filtering a specific property
  location?: string;   // Optional location search term
  type?: string;       // Optional property type filter
  beds?: number;       // Optional minimum beds filter
  baths?: number;      // Optional minimum baths filter
  minPrice?: number;   // Optional minimum price filter
  maxPrice?: number;   // Optional maximum price filter
  petsAllowed?: boolean; // Optional pets allowed filter
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body: AvailabilityRequest = await request.json()
    
    const { 
      startDate, 
      endDate, 
      propertyId, 
      location, 
      type, 
      beds, 
      baths, 
      minPrice, 
      maxPrice, 
      petsAllowed 
    } = body
    
    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }
    
    // Parse dates
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    
    // Validate date range
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      )
    }

    logger.info(`Searching for available properties from ${startDate} to ${endDate}`)
    
    // Start building the properties query with base filters
    let propertiesQuery = supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
    
    // Apply additional filters if provided
    if (propertyId) {
      propertiesQuery = propertiesQuery.eq('id', propertyId)
    }
    
    if (location) {
      propertiesQuery = propertiesQuery.ilike('location', `%${location}%`)
    }
    
    if (type) {
      propertiesQuery = propertiesQuery.eq('property_type', type)
    }
    
    if (beds) {
      propertiesQuery = propertiesQuery.gte('bedrooms', beds)
    }
    
    if (baths) {
      propertiesQuery = propertiesQuery.gte('bathrooms', baths)
    }
    
    if (minPrice) {
      propertiesQuery = propertiesQuery.or(`sale_price.gte.${minPrice},rental_price.gte.${minPrice}`)
    }
    
    if (maxPrice) {
      propertiesQuery = propertiesQuery.or(`sale_price.lte.${maxPrice},rental_price.lte.${maxPrice}`)
    }
    
    if (petsAllowed !== undefined) {
      propertiesQuery = propertiesQuery.eq('pets_allowed', petsAllowed)
    }
    
    // Fetch properties that match the base criteria
    const { data: allProperties, error: propertiesError } = await propertiesQuery
    
    if (propertiesError) {
      logger.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }
    
    // If no properties found, return empty array
    if (!allProperties || allProperties.length === 0) {
      return NextResponse.json([])
    }
    
    // Get all property IDs
    const propertyIds = allProperties.map(property => property.id)
    
    // Fetch bookings that overlap with the requested date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('property_id, check_in, check_out')
      .in('property_id', propertyIds)
      .or(`check_in.lte.${endDate},check_out.gte.${startDate}`)
      .in('status', ['confirmed', 'pending'])
    
    if (bookingsError) {
      logger.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }
    
    // Fetch manual unavailability periods from property_availability table
    const { data: unavailabilityPeriods, error: unavailabilityError } = await supabase
      .from('property_availability')
      .select('property_id, start_date, end_date')
      .in('property_id', propertyIds)
      .eq('status', 'unavailable')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
    
    if (unavailabilityError) {
      logger.error('Error fetching unavailability periods:', unavailabilityError)
      throw unavailabilityError
    }
    
    // Build a set of unavailable property IDs
    const unavailablePropertyIds = new Set<string>()
    
    // Map booking dates to their respective properties
    const bookingsByPropertyId: Record<string, Array<{ start: Date, end: Date }>> = {}
    
    // Process bookings to determine unavailable properties
    bookings?.forEach(booking => {
      const bookingStart = new Date(booking.check_in)
      const bookingEnd = new Date(booking.check_out)
      
      // Check if booking overlaps with requested dates
      if (bookingStart <= end && bookingEnd >= start) {
        // Add to unavailable properties
        unavailablePropertyIds.add(booking.property_id)
        
        // Also track the booking details per property
        if (!bookingsByPropertyId[booking.property_id]) {
          bookingsByPropertyId[booking.property_id] = []
        }
        
        bookingsByPropertyId[booking.property_id].push({
          start: bookingStart,
          end: bookingEnd
        })
      }
    })
    
    // Process manual unavailability periods
    unavailabilityPeriods?.forEach(period => {
      const periodStart = new Date(period.start_date)
      const periodEnd = new Date(period.end_date)
      
      // Check if period overlaps with requested dates
      if (periodStart <= end && periodEnd >= start) {
        // Add to unavailable properties
        unavailablePropertyIds.add(period.property_id)
      }
    })
    
    // Filter properties to only include available ones
    const availableProperties = allProperties.filter(property => {
      // Check if property is in the unavailable set
      if (unavailablePropertyIds.has(property.id)) {
        return false
      }
      
      // Additional check for property availability dates if they exist
      if (property.available_from && new Date(property.available_from) > start) {
        return false
      }
      
      if (property.available_to && new Date(property.available_to) < end) {
        return false
      }
      
      return true
    })
    
    // For debugging, add availability context to each property
    const propertiesWithContext = availableProperties.map(property => {
      return {
        ...property,
        _availabilityContext: {
          requestedPeriod: { start, end },
          bookings: bookingsByPropertyId[property.id] || [],
          isAvailable: true
        }
      }
    })
    
    logger.info(`Found ${availableProperties.length} available properties out of ${allProperties.length} total properties`)
    
    return NextResponse.json(availableProperties)
  } catch (err) {
    logger.error('Failed to filter properties by availability:', err)
    return NextResponse.json(
      { error: 'Failed to filter properties by availability' },
      { status: 500 }
    )
  }
}

// For direct GET requests (used for general availability data)
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start') || format(new Date(), 'yyyy-MM-dd', { locale: enUS })
  const endDate = searchParams.get('end') || format(addDays(new Date(), 60), 'yyyy-MM-dd', { locale: enUS })
  const propertyId = searchParams.get('propertyId') || undefined
  
  logger.info(`Fetching availability data from ${startDate} to ${endDate} for ${propertyId || 'all properties'}`)
  
  try {
    // Fetch all properties or a specific one
    const propertiesQuery = propertyId 
      ? supabase.from('properties').select('id').eq('id', propertyId)
      : supabase.from('properties').select('id').eq('status', 'available')
    
    const { data: properties, error: propertiesError } = await propertiesQuery
    
    if (propertiesError) {
      logger.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }
    
    const totalProperties = properties?.length || 0
    
    // If no properties found, return empty data
    if (totalProperties === 0) {
      return NextResponse.json([])
    }
    
    const propertyIds = properties.map(p => p.id)
    
    // Fetch bookings that overlap with the date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('property_id, check_in, check_out, status')
      .in('property_id', propertyIds)
      .or(`check_in.lte.${endDate},check_out.gte.${startDate}`)
      .in('status', ['confirmed', 'pending'])
    
    if (bookingsError) {
      logger.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }
    
    // Generate date range for the requested period
    const dateRange = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate)
    })
    
    // Create an availability map for each date
    const availabilityMap = new Map<string, {
      date: string;
      availableCount: number;
      totalProperties: number;
      status: 'available' | 'partial' | 'booked';
    }>()
    
    // Initialize all dates as fully available
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd', { locale: enUS })
      availabilityMap.set(dateKey, {
        date: dateKey,
        availableCount: totalProperties,
        totalProperties,
        status: 'available'
      })
    })
    
    // Update availability based on bookings
    bookings?.forEach(booking => {
      const bookingDateRange = eachDayOfInterval({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out)
      })
      
      bookingDateRange.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd', { locale: enUS })
        const currentDayData = availabilityMap.get(dateKey)
        
        if (currentDayData) {
          const newAvailableCount = currentDayData.availableCount - 1
          const newStatus = newAvailableCount === 0 ? 'booked' : 
                           newAvailableCount < totalProperties ? 'partial' : 'available'
          
          availabilityMap.set(dateKey, {
            ...currentDayData,
            availableCount: newAvailableCount,
            status: newStatus
          })
        }
      })
    })
    
    // Convert map to array
    const availabilityData = Array.from(availabilityMap.values())
    
    logger.info('Generated availability data with dates:', availabilityData.length)
    
    return NextResponse.json(availabilityData)
  } catch (err) {
    logger.error('Failed to fetch availability data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}