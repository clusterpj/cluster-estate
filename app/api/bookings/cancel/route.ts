import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { voidPayPalPayment } from '@/lib/paypal'
import { sendBookingCancellationEmail } from '@/lib/emails'
import { updatePropertyAvailability } from '@/lib'

export async function POST(request: Request) {
  try {
    const { bookingId, reason } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify that the booking belongs to the user
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this booking' },
        { status: 403 }
      )
    }

    // Check if booking is already canceled or completed
    if (booking.status === 'canceled' || booking.status === 'completed') {
      return NextResponse.json(
        { error: `Booking cannot be canceled because it is already ${booking.status}` },
        { status: 400 }
      )
    }

    const newStatus = 'canceled'
    const paymentDetails = booking.payment_details as { 
      authorization_id?: string;
      order_id?: string;
    } | null

    // Try both authorization_id and order_id
    const authorizationId = paymentDetails?.authorization_id || paymentDetails?.order_id

    // Only attempt to void payment if there's an authorization ID and payment status is not completed
    if (authorizationId && booking.payment_status !== 'completed') {
      try {
        // Void the authorized payment
        const voidResult = await voidPayPalPayment(authorizationId)
        if (!voidResult.success) {
          throw new Error('Failed to void payment: ' + voidResult.error)
        }
      } catch (error) {
        console.error('Payment voiding error:', {
          error,
          authorizationId,
          paymentDetails
        })
        // Continue with cancellation even if payment voiding fails
        // This allows users to cancel bookings even if there's an issue with PayPal
      }
    }

    // Begin transaction to update booking status
    const { error: updateError } = await supabase.rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus,
      p_reason: reason || 'Canceled by user',
      p_admin_id: null // No admin involved in user cancellation
    })

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update booking status: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update property availability to make the dates available again
    await updatePropertyAvailability(booking.property_id, booking.check_in, booking.check_out, false)

    // Send cancellation email to guest
    try {
      await sendBookingCancellationEmail(booking)
      console.log(`Cancellation email sent for booking ID: ${bookingId}`)
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Failed to send cancellation email:', emailError)
      // We continue with the response as the booking status was updated successfully
    }

    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      message: 'Booking canceled successfully'
    })
  } catch (error) {
    console.error('Error in cancel-booking route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}