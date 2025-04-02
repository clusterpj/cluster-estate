import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
// Import both capture methods
import { capturePayPalPayment, voidPayPalPayment, capturePayPalOrder } from '@/lib/paypal'
import { sendBookingApprovalEmail, sendBookingCancellationEmail } from '@/lib/emails'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { bookingId, approved, reason } = await request.json()

    // Verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || adminData?.role !== 'admin') {
      console.error('Admin check failed:', { adminError, role: adminData?.role })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, property:properties(*)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Get the booking user's email
    const { data: bookingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', booking.user_id)
      .single()
    
    // Get email from user profile or auth
    const { data: userData } = await supabase.auth.admin.getUserById(booking.user_id)
    const userEmail = bookingUser?.email || userData?.user?.email

    if (!userEmail) {
      console.warn(`No email found for user ${booking.user_id} for booking ${bookingId}`)
    }

    // Create an extended booking with user email for email notifications
    const extendedBooking = {
      ...booking,
      user_email: userEmail
    }

    const oldStatus = booking.status
    const newStatus = approved ? 'confirmed' : 'canceled'
    const paymentDetails = booking.payment_details as { 
      authorization_id?: string;
      order_id?: string;
    } | null

    console.log('Payment details:', paymentDetails)

    // Track if payment processing was successful
    let paymentProcessed = false
    let paymentError = null
    
    // Only try to process payment if approving
    if (approved) {
      try {
        // Check if we have an authorization_id or just an order_id
        if (paymentDetails?.authorization_id) {
          // Use the authorization capture method if we have an authorization_id
          console.log('Attempting to capture payment with authorization ID:', paymentDetails.authorization_id);
          const captureResult = await capturePayPalPayment(paymentDetails.authorization_id);
          console.log('Capture result:', captureResult);
          if (captureResult.success) {
            paymentProcessed = true;
          } else {
            paymentError = captureResult.error;
          }
        } else if (paymentDetails?.order_id) {
          // Use the order capture method if we only have an order_id
          console.log('Attempting to capture order with order ID:', paymentDetails.order_id);
          try {
            const orderResult = await capturePayPalOrder(paymentDetails.order_id);
            console.log('Order capture result:', orderResult);
            paymentProcessed = true;
          } catch (error) {
            console.error('Order capture error:', error);
            paymentError = error instanceof Error ? error.message : String(error);
            
            // Try to check order status instead - sometimes orders are already captured or in a state
            // that doesn't allow capture but is still valid
            console.log('Payment capture failed, but proceeding with booking approval anyway');
            
            // We'll continue with the booking confirmation even if payment capture fails
            // This allows admins to approve bookings where payment has been processed outside the system
            // or when PayPal orders are in a state that doesn't allow capture
          }
        } else {
          paymentError = 'No payment ID found in payment details';
        }
      } catch (error) {
        console.error('Payment processing error:', {
          error,
          paymentDetails
        });
        paymentError = error instanceof Error ? error.message : 'Unknown payment processing error';
        
        // Continue with booking approval even if payment processing fails
        // This gives admins the ability to override payment issues
      }
    } else if (paymentDetails?.authorization_id) {
      // Only void if we have an authorization_id and we're rejecting the booking
      try {
        console.log('Attempting to void payment with authorization ID:', paymentDetails.authorization_id);
        const voidResult = await voidPayPalPayment(paymentDetails.authorization_id);
        console.log('Void result:', voidResult);
        if (voidResult.success) {
          paymentProcessed = true;
        } else {
          paymentError = voidResult.error;
          // Continue with booking rejection even if voiding fails
        }
      } catch (error) {
        console.error('Payment voiding error:', {
          error,
          paymentDetails
        });
        paymentError = error instanceof Error ? error.message : 'Unknown payment voiding error';
        // Continue with booking rejection even if voiding fails
      }
    }
    // If rejecting and we only have an order_id, no need to void as it hasn't been captured yet

    // Begin transaction to update booking status
    const { error: updateError } = await supabase.rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus,
      p_reason: reason || (approved ? 'Admin approved' : 'Admin rejected'),
      p_admin_id: user.id
    })

    if (updateError) {
      console.error('Failed to update booking status:', {
        error: updateError,
        bookingId,
        newStatus,
        oldStatus,
        userId: user.id
      })
      return NextResponse.json(
        { error: `Failed to update booking status: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update payment status in database if needed
    if (approved && paymentProcessed) {
      const { error: paymentUpdateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      if (paymentUpdateError) {
        console.error('Failed to update payment status:', paymentUpdateError);
        // Continue anyway, as the booking status update was successful
      }
    }

    // Send email notification based on approval decision
    try {
      if (approved) {
        // Send approval email to guest using the extended booking with user_email
        console.log(`Attempting to send approval email to: ${userEmail || 'unknown email'}`);
        await sendBookingApprovalEmail(extendedBooking);
        console.log(`Approval email sent for booking ID: ${bookingId}`);
      } else {
        // Send cancellation email to guest
        await sendBookingCancellationEmail(extendedBooking);
        console.log(`Cancellation email sent for booking ID: ${bookingId}`);
      }
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Failed to send notification email:', emailError);
      // We continue with the response as the booking status was updated successfully
    }

    // Return success response, including any payment issues as a warning
    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      paymentProcessed,
      paymentWarning: paymentError,
      message: approved 
        ? (paymentProcessed ? 'Booking approved and payment completed' : 'Booking approved but payment processing had issues')
        : 'Booking rejected'
    })
  } catch (error) {
    console.error('Error in approve-booking route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
