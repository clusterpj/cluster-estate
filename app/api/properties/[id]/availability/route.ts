import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PropertyAvailability } from '@/types/property'
import { addDays, eachDayOfInterval, format } from 'date-fns'
import { logger } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')
  
  try {
    logger.info(`Fetching availability for property ${params.id} from ${startDate} to ${endDate}`)
    
    // Fetch property details to get availability settings
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('availability')
      .eq('id', params.id)
      .single()

    if (propertyError) {
      logger.error('Error fetching property details:', propertyError)
      throw propertyError
    }

    logger.info('Property availability settings:', property.availability)

    // Fetch bookings within date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('property_id', params.id)
      .gte('check_in', startDate || new Date().toISOString())
      .lte('check_out', endDate || addDays(new Date(), 30).toISOString())

    if (bookingsError) {
      logger.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }

    logger.info(`Found ${bookings.length} bookings for property ${params.id}:`, bookings)

    // Generate date range
    const dateRange = eachDayOfInterval({
      start: new Date(startDate || new Date()),
      end: new Date(endDate || addDays(new Date(), 30))
    })

    // Create availability map
    const availabilityMap = new Map<string, PropertyAvailability>()
    
    // Mark all dates as available initially
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      availabilityMap.set(dateKey, {
        date: dateKey,
        status: 'available',
        propertyId: params.id
      })
    })

    // Process bookings to mark unavailable dates
    bookings.forEach(booking => {
      const bookingDates = eachDayOfInterval({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out)
      })
      
      // Check minimum rental period
      const rentalPeriod = differenceInDays(
        new Date(booking.check_out),
        new Date(booking.check_in)
      )
      
      bookingDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const currentStatus = availabilityMap.get(dateKey)?.status || 'available'
        
        // Only update status if more restrictive
        const newStatus = getMostRestrictiveStatus(currentStatus, booking.status)
        
        availabilityMap.set(dateKey, {
          date: dateKey,
          status: newStatus,
          propertyId: params.id,
          rentalPeriod: rentalPeriod < (property.availability?.minimum_rental_period || 1) 
            ? 'invalid' 
            : 'valid'
        })
      })
    })

    // Helper function to determine most restrictive status
    function getMostRestrictiveStatus(current: string, incoming: string): string {
      const statusPriority = ['booked', 'pending', 'partial', 'available']
      const currentIndex = statusPriority.indexOf(current)
      const incomingIndex = statusPriority.indexOf(incoming)
      return statusPriority[Math.min(currentIndex, incomingIndex)]
    }

    // Convert map to array
    const availability = Array.from(availabilityMap.values())
    
    logger.info('Final availability data:', availability)
    
    return NextResponse.json(availability)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}
