import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
// Remove unused imports
import { capturePayPalPayment, voidPayPalPayment } from '@/lib/paypal'

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
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const oldStatus = booking.status
    const newStatus = approved ? 'confirmed' : 'canceled'
    const paymentDetails = booking.payment_details as { 
      authorization_id?: string;
      order_id?: string;
    } | null

    console.log('Payment details:', paymentDetails)

    // Try both authorization_id and order_id
    const authorizationId = paymentDetails?.authorization_id || paymentDetails?.order_id

    if (!authorizationId) {
      console.error('Payment authorization ID not found in:', paymentDetails)
      return NextResponse.json(
        { error: 'Payment authorization ID not found' },
        { status: 400 }
      )
    }

    // Handle PayPal payment based on approval decision
    try {
      if (approved) {
        console.log('Attempting to capture payment with authorization ID:', authorizationId);
        // Capture the authorized payment
        const captureResult = await capturePayPalPayment(authorizationId)
        console.log('Capture result:', captureResult);
        if (!captureResult.success) {
          throw new Error('Failed to capture payment: ' + captureResult.error)
        }
      } else {
        console.log('Attempting to void payment with authorization ID:', authorizationId);
        // Void the authorized payment
        const voidResult = await voidPayPalPayment(authorizationId)
        console.log('Void result:', voidResult);
        if (!voidResult.success) {
          throw new Error('Failed to void payment: ' + voidResult.error)
        }
      }
    } catch (error) {
      console.error('Payment processing error:', {
        error,
        authorizationId,
        paymentDetails
      });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process payment' },
        { status: 500 }
      )
    }

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

    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      message: approved ? 'Booking approved and payment captured' : 'Booking rejected and payment voided'
    })
  } catch (error) {
    console.error('Error in approve-booking route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
