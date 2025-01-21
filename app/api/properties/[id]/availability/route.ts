import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PropertyStatus } from '@/types/property'
import { eachDayOfInterval, format } from 'date-fns'
import { logger } from '@/lib/logger'

interface AvailabilityResponse {
  date: string
  status: PropertyStatus
  propertyId: string
  available_from: string
  available_to: string
  minimum_rental_period: number
  max_guests: number
  created_at: string
  updated_at: string
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  // Validate date parameters
  if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
    return NextResponse.json(
      { error: 'Invalid date parameters' },
      { status: 400 }
    )
  }

  try {
    logger.info(`Fetching availability for property ${params.id} from ${startDate} to ${endDate}`)

    // Fetch property details including availability settings
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('*, property_availability_rules(*)')
      .eq('id', params.id)
      .single()

    if (propertyError || !propertyData) {
      logger.error('Error fetching property:', propertyError)
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Extract availability settings
    const availabilitySettings = propertyData.availability?.[0] || {
      minimum_rental_period: 1,
      max_guests: 2
    }

    // Fetch bookings within date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('property_id', params.id)
      .gte('check_in', startDate)
      .lte('check_out', endDate)

    if (bookingsError) {
      logger.error('Error fetching bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to fetch booking details' },
        { status: 500 }
      )
    }

    // Generate date range
    const dateRange = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate)
    })

    // Create availability map
    const availabilityMap = new Map<string, AvailabilityResponse>()

    // Mark all dates as available initially
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      availabilityMap.set(dateKey, {
        date: dateKey,
        status: 'available',
        propertyId: params.id,
        available_from: propertyData.available_from || dateKey,
        available_to: propertyData.available_to || dateKey,
        minimum_rental_period: availabilitySettings.minimum_rental_period,
        max_guests: availabilitySettings.max_guests,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    // Process bookings to mark unavailable dates
    bookings?.forEach(booking => {
      const bookingDates = eachDayOfInterval({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out)
      })

      bookingDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        if (availabilityMap.has(dateKey)) {
          const currentEntry = availabilityMap.get(dateKey)!
          availabilityMap.set(dateKey, {
            ...currentEntry,
            status: booking.status === 'confirmed' ? 'booked' : 
                   booking.status === 'pending' ? 'pending' : 
                   currentEntry.status
          })
        }
      })
    })

    // Convert map to array
    const availability = Array.from(availabilityMap.values())
    logger.info('Generated availability data:', availability)

    return NextResponse.json(availability)
  } catch (error) {
    logger.error('Error processing availability:', error)
    return NextResponse.json(
      { error: 'Failed to process availability data' },
      { status: 500 }
    )
  }
}
