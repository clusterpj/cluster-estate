import { createPayPalOrder, createBooking } from '@/lib/paypal'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PayPalBookingData } from '@/types/booking'

export async function POST(request: Request) {
  try {
    console.log('Received booking request')
    const bookingData: PayPalBookingData = await request.json()
    console.log('Booking data:', bookingData)

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    console.log('Creating Supabase client...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', user.id)

    // Create booking with RLS check
    console.log('Creating booking in database...')
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Booking created successfully:', data)

    if (error) throw error

    // Create PayPal order after successful booking creation
    console.log('Creating PayPal order...')
    const order = await createPayPalOrder(bookingData)
    console.log('PayPal order created:', order)

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
