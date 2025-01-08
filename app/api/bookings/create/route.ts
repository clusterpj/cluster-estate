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
    // Create booking with RLS check
    console.log('Creating booking in database...')
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: bookingData.guests,
        special_requests: bookingData.special_requests,
        user_id: user.id,
        property_id: bookingData.propertyId,
        total_price: bookingData.totalPrice,
        payment_status: 'pending'
      })
      .select('*')
      .single()

    if (bookingError) {
      console.error('Database error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError },
        { status: 500 }
      )
    }

    console.log('Booking created successfully:', booking)

    // Create PayPal order after successful booking creation
    console.log('Creating PayPal order...')
    try {
      const order = await createPayPalOrder(bookingData)
      console.log('PayPal order created:', order)

      // Update booking with PayPal order ID
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_id: order.id })
        .eq('id', booking.id)

      if (updateError) {
        console.error('Error updating booking with PayPal ID:', updateError)
      }

      return NextResponse.json({
        bookingId: booking.id,
        paypalOrderId: order.id
      })
    } catch (paypalError) {
      console.error('Error creating PayPal order:', paypalError)
      
      // If PayPal fails, mark booking as failed
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id)

      return NextResponse.json(
        { 
          error: 'Failed to create PayPal order',
          bookingId: booking.id, // Return booking ID even if PayPal failed
          details: paypalError instanceof Error ? paypalError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
