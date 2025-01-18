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
      
      bookingDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        availabilityMap.set(dateKey, {
          date: dateKey,
          status: booking.status,
          propertyId: params.id
        })
      })
    })

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
