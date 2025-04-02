import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
// Remove unused imports - PaymentStatus and BookingStatus are not actually used

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
    const paymentStatus = bookingData.payerDetails?.details?.status?.toLowerCase() === 'completed' 
      ? 'completed' 
      : 'authorized'

    // Set booking status to awaiting approval when payment is authorized
    const bookingStatus = 'awaiting-approval'
    
    console.log('Creating booking with status:', {
      paymentStatus,
      bookingStatus,
      paymentDetails: bookingData.payerDetails?.details
    })
    
    // Check for any conflicting unavailable dates
    const { data: conflicts, error: availabilityError } = await supabase
      .from('property_availability')
      .select('*')
      .eq('property_id', bookingData.propertyId)
      .eq('status', 'unavailable')
      .or(`and(start_date.lte.${new Date(bookingData.checkOut).toISOString()},end_date.gte.${new Date(bookingData.checkIn).toISOString()})`)

    if (availabilityError) {
      console.error('Availability check failed:', availabilityError)
      return NextResponse.json(
        { error: 'Failed to check property availability.' },
        { status: 500 }
      )
    }

    // If there are any conflicting unavailable dates, reject the booking
    if (conflicts && conflicts.length > 0) {
      console.error('Date conflict found:', conflicts)
      return NextResponse.json(
        { error: 'Property is not available for the selected dates.' },
        { status: 400 }
      )
    }

    // Extract authorization ID from PayPal response
    const authorizationId = bookingData.payerDetails?.details?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id ||
                          bookingData.payerDetails?.details?.id;

    if (!authorizationId) {
      console.error('No authorization ID found in payment details:', bookingData.payerDetails?.details);
      return NextResponse.json(
        { error: 'No payment authorization ID found' },
        { status: 400 }
      );
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
        status: bookingStatus,
        payment_status: paymentStatus,
        payment_details: {
          order_id: bookingData.payerDetails?.details?.id,
          payer_id: bookingData.payerDetails?.id,
          status: bookingData.payerDetails?.details?.status,
          intent: bookingData.payerDetails?.details?.intent,
          purchase_units: bookingData.payerDetails?.details?.purchase_units,
          authorization_id: authorizationId
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Failed to create booking:', {
        error: bookingError,
        data: {
          checkIn: new Date(bookingData.checkIn),
          checkOut: new Date(bookingData.checkOut),
          guests: bookingData.guests,
          userId: user.id,
          propertyId: bookingData.propertyId,
          totalPrice: bookingData.totalPrice,
          paymentId: bookingData.paymentId,
          status: bookingStatus,
          paymentStatus
        }
      })
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message}` },
        { status: 500 }
      )
    }

    if (!booking) {
      console.error('No booking returned after creation')
      return NextResponse.json(
        { error: 'Failed to create booking: No booking returned' },
        { status: 500 }
      )
    }

    console.log('Successfully created booking:', booking)
    
    // Send booking confirmation email
    try {
      // Import here to avoid circular dependencies
      const { sendBookingConfirmationEmail } = await import('@/lib/emails')
      await sendBookingConfirmationEmail(booking)
      console.log(`Confirmation email sent for booking ID: ${booking.id}`)
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Failed to send confirmation email:', emailError)
      // We continue with the response as the booking was created successfully
    }
    
    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Unexpected error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
