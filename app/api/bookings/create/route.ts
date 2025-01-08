import { createPayPalOrder, createBooking } from '@/lib/paypal'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PayPalBookingData } from '@/types/booking'

export async function POST(request: Request) {
  try {
    const bookingData: PayPalBookingData = await request.json()
    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create booking in database
    const booking = await createBooking(bookingData, user.id)

    // Create PayPal order
    const order = await createPayPalOrder(bookingData)

    return NextResponse.json({
      bookingId: booking.id,
      paypalOrderId: order.id
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}