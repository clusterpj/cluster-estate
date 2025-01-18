import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PropertyAvailability } from '@/types/property'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Fetch all bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out, status, property_id')

    if (error) throw error

    // Aggregate availability data
    const availabilityMap = new Map<string, PropertyAvailability>()
    
    bookings.forEach(booking => {
      const dateKey = new Date(booking.check_in).toISOString().split('T')[0]
      const existing = availabilityMap.get(dateKey) || {
        date: dateKey,
        status: booking.status,
        propertyCount: 0
      }
      
      availabilityMap.set(dateKey, {
        ...existing,
        propertyCount: (existing.propertyCount || 0) + 1
      })
    })

    const availability = Array.from(availabilityMap.values())
    
    return NextResponse.json(availability)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}
