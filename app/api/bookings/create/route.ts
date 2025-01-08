import { config } from '@/lib/config'
import { createPayPalOrder, createBooking } from '@/lib/paypal'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PayPalBookingData } from '@/types/booking'
import { 
  BookingPaymentStatus, 
  BookingStatus,
  getBookingStatusForPaymentStatus,
  canTransitionPaymentStatus
} from '@/types/booking-status'

export async function POST(request: Request) {
  try {
    console.log('Received booking request')
    const bookingData: PayPalBookingData = await request.json()
    console.log('Booking data:', bookingData)

    // Validate required fields
    if (!bookingData || 
        !bookingData.checkIn || 
        !bookingData.checkOut || 
        !bookingData.guests || 
        !bookingData.propertyId ||
        !bookingData.totalPrice) {
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

    // Create booking with RLS check
    console.log('Creating booking in database...')
    const initialPaymentStatus = BookingPaymentStatus.PENDING
    const initialStatus = getBookingStatusForPaymentStatus(initialPaymentStatus)
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        special_requests: bookingData.special_requests,
        user_id: user.id,
        property_id: bookingData.propertyId,
        total_price: bookingData.totalPrice,
        payment_status: initialPaymentStatus,
        status: initialStatus
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
    
    // Validate total price exists and is a number
    if (!bookingData.totalPrice || typeof bookingData.totalPrice !== 'number') {
      console.error('Invalid total price:', bookingData.totalPrice)
      return NextResponse.json(
        { error: 'Invalid total price' },
        { status: 400 }
      )
    }

    try {
      // Prepare PayPal order data
      const paypalOrderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: bookingData.totalPrice.toFixed(2),
          },
          description: `Booking for property ${bookingData.propertyId}`,
          custom_id: booking.id,
          invoice_id: `BOOKING-${booking.id}`,
        }],
        application_context: {
          brand_name: 'Cluster Estate',
          user_action: 'PAY_NOW',
          return_url: `${config.siteUrl}/bookings/${booking.id}/success`,
          cancel_url: `${config.siteUrl}/bookings/${booking.id}/cancel`,
        }
      }

      console.log('PayPal order data:', paypalOrderData)
      
      const order = await createPayPalOrder(paypalOrderData)
      console.log('PayPal order created:', order)

      if (!order || !order.id) {
        throw new Error('Invalid PayPal order response')
      }

      // Validate status transition
      if (!canTransitionPaymentStatus(booking.payment_status, BookingPaymentStatus.CREATED)) {
        throw new Error(`Invalid status transition from ${booking.payment_status} to created`)
      }

      // Update booking with PayPal order ID and new status
      const newPaymentStatus = BookingPaymentStatus.CREATED
      const newStatus = getBookingStatusForPaymentStatus(newPaymentStatus)
      
      // Validate status values before update
      if (!isValidPaymentStatus(newPaymentStatus) || !isValidBookingStatus(newStatus)) {
        throw new Error('Invalid status values for booking update')
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          payment_id: order.id,
          payment_status: newPaymentStatus,
          status: newStatus
        })
        .eq('id', booking.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating booking with PayPal ID:', {
          error: updateError,
          currentStatus: booking.payment_status,
          newStatus: newPaymentStatus,
          bookingId: booking.id
        })
        throw new Error(`Failed to update booking with PayPal ID: ${updateError.message}`)
      }

      console.log('Booking successfully updated:', {
        id: booking.id,
        paymentStatus: newPaymentStatus,
        status: newStatus
      })

      console.log('Booking status updated to created')

      return NextResponse.json({
        bookingId: booking.id,
        paypalOrderId: order.id,
        approvalUrl: order.links.find(link => link.rel === 'approve')?.href
      })
    } catch (paypalError) {
      console.error('Error creating PayPal order:', paypalError)
      
      // If PayPal fails, validate and update status
      const failedPaymentStatus = BookingPaymentStatus.FAILED
      const failedStatus = getBookingStatusForPaymentStatus(failedPaymentStatus)
      
      if (canTransitionPaymentStatus(booking.payment_status, failedPaymentStatus)) {
        await supabase
          .from('bookings')
          .update({ 
            payment_status: failedPaymentStatus,
            status: failedStatus
          })
          .eq('id', booking.id)
      } else {
        console.error('Invalid status transition to failed from:', booking.payment_status)
      }

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
