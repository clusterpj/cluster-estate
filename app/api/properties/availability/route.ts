import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PropertyAvailability } from '@/types/property'
import { addDays, eachDayOfInterval, format } from 'date-fns'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')
  
  try {
    // Fetch all properties to get total count
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')

    if (propertiesError) throw propertiesError

    const totalProperties = properties.length

    // Fetch bookings within date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in, check_out, status, property_id')
      .gte('check_in', startDate || new Date().toISOString())
      .lte('check_out', endDate || addDays(new Date(), 30).toISOString())

    if (bookingsError) throw bookingsError

    // Generate date range
    const dateRange = eachDayOfInterval({
      start: new Date(startDate || new Date()),
      end: new Date(endDate || addDays(new Date(), 30))
    })

    // Create availability map
    const availabilityMap = new Map<string, PropertyAvailability>()
    
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
      
      bookingDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const existing = availabilityMap.get(dateKey) || {
          date: dateKey,
          status: 'available',
          propertyCount: totalProperties
        }
        
        availabilityMap.set(dateKey, {
          date: dateKey,
          status: booking.status,
          propertyCount: (existing.propertyCount || totalProperties) - 1
        })
      })
    })

    // Convert map to array
    const availability = Array.from(availabilityMap.values())
    
    return NextResponse.json(availability)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}
