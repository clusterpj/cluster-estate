import { config } from '@/lib/config'
import { createPayPalOrder } from '@/lib/paypal'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PayPalBookingData } from '@/types/booking'
import { 
  PaymentStatus,
  BookingStatus
} from '@/types/booking-status'

export async function POST(request: Request) {
  try {
    console.log('Received booking request')
    const bookingData = await request.json()
    console.log('Booking data:', bookingData)

    // Validate required fields
    if (!bookingData || 
        !bookingData.checkIn || 
        !bookingData.checkOut || 
        !bookingData.guests || 
        !bookingData.propertyId ||
        !bookingData.totalPrice ||
        !bookingData.paymentId) {
      console.error('Missing required booking data:', bookingData)
      return NextResponse.json(
        { error: 'Missing required booking data' },
        { status: 400 }
      )
    }

    // Validate totalPrice is a number
    if (typeof bookingData.totalPrice !== 'number' || isNaN(bookingData.totalPrice)) {
      console.error('Invalid totalPrice:', bookingData.totalPrice)
      return NextResponse.json(
        { error: 'Invalid total price' },
        { status: 400 }
      )
    }

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

    // Set payment status based on PayPal response
    const paymentStatus = bookingData.paymentStatus === 'completed' 
      ? PaymentStatus.COMPLETED 
      : PaymentStatus.PENDING

    // Set booking status based on payment status
    const bookingStatus = paymentStatus === PaymentStatus.COMPLETED 
      ? BookingStatus.CONFIRMED 
      : BookingStatus.PENDING
    
    console.log('Creating booking with status:', { paymentStatus, bookingStatus })
    
    // ** AVAILABILITY CHECK **
    const { data: availability, error: availabilityError } = await supabase
      .from('property_availability')
      .select('*')
      .eq('property_id', bookingData.propertyId)
      .or(`and(start_date.lte.${new Date(bookingData.checkOut).toISOString()},end_date.gte.${new Date(bookingData.checkIn).toISOString()})`)
      .single()

    if (availabilityError || !availability) {
      console.error('Availability check failed:', availabilityError)
      return NextResponse.json(
        { error: 'Property is not available for the selected dates.' },
        { status: 400 }
      )
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        check_in: new Date(bookingData.checkIn),
        check_out: new Date(bookingData.checkOut),
        guests: bookingData.guests,
        special_requests: bookingData.specialRequests,
        user_id: user.id,
        property_id: bookingData.propertyId,
        total_price: bookingData.totalPrice,
        payment_id: bookingData.paymentId,
        payment_status: paymentStatus,
        status: bookingStatus
      })
      .select('*')
      .single()

    if (bookingError) {
      console.error('Database error details:', {
        code: bookingError.code,
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint,
        statusValues: { paymentStatus, bookingStatus },
        bookingData
      })
      
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError.message },
        { status: 500 }
      )
    }

    if (!booking) {
      console.error('No booking returned after insert')
      return NextResponse.json(
        { error: 'Failed to create booking - no data returned' },
        { status: 500 }
      )
    }

    console.log('Booking created successfully:', booking)
    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Unexpected error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
