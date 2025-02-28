import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { addDays, eachDayOfInterval, format } from 'date-fns'
import { logger } from '@/lib/logger'

// Define a simpler interface for our aggregate availability data
interface AggregateAvailability {
  date: string;
  status: 'available' | 'booked' | 'pending' | 'limited';
  propertyCount: number;
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start') || format(new Date(), 'yyyy-MM-dd')
  const endDate = searchParams.get('end') || format(addDays(new Date(), 60), 'yyyy-MM-dd')
  
  logger.info(`Fetching aggregate availability from ${startDate} to ${endDate} for ${request.headers.get('referer')}`)
  
  try {
    logger.info(`Fetching aggregate availability from ${startDate} to ${endDate}`)
    
    // Fetch all properties to get total count
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')

    if (propertiesError) {
      logger.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }

    const totalProperties = properties.length
    logger.info(`Total properties found: ${totalProperties}`)

    // Fetch bookings within date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in, check_out, status, property_id')
      .gte('check_in', startDate || new Date().toISOString())
      .lte('check_out', endDate || addDays(new Date(), 30).toISOString())

    if (bookingsError) {
      logger.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }

    logger.info(`Found ${bookings.length} bookings across all properties:`, bookings)

    // Generate date range
    const dateRange = eachDayOfInterval({
      start: new Date(startDate || new Date()),
      end: new Date(endDate || addDays(new Date(), 30))
    })

    // Create availability map
    const availabilityMap = new Map<string, AggregateAvailability>()
    
    // Initialize all dates with available status
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      availabilityMap.set(dateKey, {
        date: dateKey,
        status: 'available',
        propertyCount: totalProperties
      })
    })

    // Process bookings to update availability
    bookings.forEach(booking => {
      const bookingDates = eachDayOfInterval({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out)
      })
      
      logger.info(`Processing booking from ${booking.check_in} to ${booking.check_out} with status ${booking.status}`)
      
      bookingDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const existing = availabilityMap.get(dateKey) || {
          date: dateKey,
          status: 'available',
          propertyCount: totalProperties
        }
        
        const newPropertyCount = (existing.propertyCount || totalProperties) - 1
        
        // Calculate new status based on availability percentage
        const availabilityPercentage = (newPropertyCount / totalProperties) * 100
        let newStatus = existing.status
        
        if (booking.status === 'confirmed') {
          newStatus = 'booked'
        } else if (availabilityPercentage < 100 && availabilityPercentage > 0) {
          newStatus = 'limited' // Changed from 'partial' to 'limited' which is in our type
        } else if (availabilityPercentage === 0) {
          newStatus = 'booked'
        } else if (booking.status === 'pending') {
          newStatus = 'pending'
        }
        
        logger.info(`Updating date ${dateKey} from status ${existing.status} to ${newStatus} with ${newPropertyCount}/${totalProperties} properties available`)
        
        availabilityMap.set(dateKey, {
          date: dateKey,
          status: newStatus,
          propertyCount: newPropertyCount
        })
      })
    })

    // Convert map to array
    const availability = Array.from(availabilityMap.values())
    
    logger.info('Final aggregate availability data:', availability)
    
    return NextResponse.json(availability)
  } catch (err) { // Renamed 'error' to 'err' to avoid eslint warning
    logger.error('Failed to fetch availability data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}
