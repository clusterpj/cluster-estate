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
        !bookingData.paymentDetails) {
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

    // Get user email for the booking
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()
    
    const userEmail = userProfile?.email || user.email

    // Set payment status to a valid value in the database constraint
    // Valid values are likely: 'pending', 'completed', 'failed', 'refunded'
    const paymentStatus = 'pending'

    // Set booking status to awaiting approval when payment is authorized
    const bookingStatus = 'awaiting-approval'
    
    console.log('Creating booking with status:', {
      paymentStatus,
      bookingStatus,
      paymentDetails: bookingData.paymentDetails
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

    // Extract order ID and payer ID from payment details
    const orderId = bookingData.paymentDetails.orderID;
    const payerId = bookingData.paymentDetails.payerID;

    if (!orderId) {
      console.error('No order ID found in payment details:', bookingData.paymentDetails);
      return NextResponse.json(
        { error: 'No payment order ID found' },
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
        payment_id: orderId, // Use orderId as paymentId
        status: bookingStatus,
        payment_status: paymentStatus,
        payment_details: {
          order_id: orderId,
          payer_id: payerId,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Removed user_email from here as it doesn't exist in the schema
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
          paymentId: orderId,
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
    
    // Create an extended booking object with the user email for email confirmation
    const extendedBooking = {
      ...booking,
      user_email: userEmail
    }
    
    // Send booking confirmation email
    try {
      // Import here to avoid circular dependencies
      const { sendBookingConfirmationEmail } = await import('@/lib/emails')
      await sendBookingConfirmationEmail(extendedBooking)
      console.log(`Confirmation email sent for booking ID: ${booking.id}`)
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Failed to send confirmation email:', emailError)
      // We continue with the response as the booking was created successfully
    }
    
    // Return the booking ID explicitly in the response for client-side redirection
    return NextResponse.json({ 
      booking,
      id: booking.id, // Make sure the ID is clearly available at the top level
      success: true
    })

  } catch (error) {
    console.error('Unexpected error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
