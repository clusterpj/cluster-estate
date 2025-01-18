import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PropertyAvailability } from '@/types/property'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Fetch availability for specific property
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('property_id', params.id)

    if (error) throw error

    // Transform bookings into availability data
    const availability: PropertyAvailability[] = bookings.map(booking => ({
      date: booking.check_in,
      status: booking.status,
      propertyId: params.id
    }))

    return NextResponse.json(availability)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}
