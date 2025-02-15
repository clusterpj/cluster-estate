import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { calendarSyncService } from '@/services/calendar-sync'
import { formatISO } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { property_id: string } }
) {
  try {
    const propertyId = params.property_id
    const supabase = createRouteHandlerClient({ cookies })

    // Verify property exists and get its details
    const { data: property } = await supabase
      .from('properties')
      .select('title, location')
      .eq('id', propertyId)
      .single()

    if (!property) {
      return new NextResponse('Property not found', { status: 404 })
    }

    // Get property availability
    const { data: availability } = await supabase
      .from('property_availability')
      .select('*')
      .eq('property_id', propertyId)

    // Get property bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['confirmed', 'pending'])

    // Generate iCal content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cluster Estate//Property Calendar//EN
X-WR-CALNAME:${property.title}
X-WR-CALDESC:Availability calendar for ${property.title}
CALSCALE:GREGORIAN
METHOD:PUBLISH
`

    // Add availability blocks
    if (availability) {
      availability.forEach((block) => {
        const startDate = new Date(block.start_date)
        const endDate = new Date(block.end_date)
        icsContent += `
BEGIN:VEVENT
UID:${block.external_id || crypto.randomUUID()}@cluster-estate
DTSTAMP:${formatISO(new Date()).replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${formatISO(startDate).replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${formatISO(endDate).replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${block.status === 'unavailable' ? 'Not Available' : 'Available'}
STATUS:${block.status === 'unavailable' ? 'CONFIRMED' : 'TENTATIVE'}
LOCATION:${property.location}
END:VEVENT`
      })
    }

    // Add bookings
    if (bookings) {
      bookings.forEach((booking) => {
        const startDate = new Date(booking.check_in)
        const endDate = new Date(booking.check_out)
        icsContent += `
BEGIN:VEVENT
UID:booking-${booking.id}@cluster-estate
DTSTAMP:${formatISO(new Date()).replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${formatISO(startDate).replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${formatISO(endDate).replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Booked
STATUS:CONFIRMED
LOCATION:${property.location}
DESCRIPTION:Booking for ${booking.guests} guests
END:VEVENT`
      })
    }

    icsContent += '\nEND:VCALENDAR'

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${propertyId}-calendar.ics"`
      }
    })
  } catch (error) {
    console.error('Error generating iCal feed:', error)
    return new NextResponse('Error generating calendar feed', { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { property_id: string } }
) {
  try {
    const propertyId = params.property_id
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { feedId } = body

    if (!feedId) {
      return new NextResponse('Feed ID is required', { status: 400 })
    }

    // Verify the feed belongs to this property
    const { data: feed } = await supabase
      .from('calendar_feeds')
      .select('*')
      .eq('id', feedId)
      .eq('property_id', propertyId)
      .single()

    if (!feed) {
      return new NextResponse('Feed not found for this property', { status: 404 })
    }

    const result = await calendarSyncService.processSyncJob(feedId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return new NextResponse('Error syncing calendar', { status: 500 })
  }
}