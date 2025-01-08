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

    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create booking with RLS check
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Create PayPal order after successful booking creation
    const order = await createPayPalOrder(bookingData)

    return NextResponse.json({
      bookingId: data.id,
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
}