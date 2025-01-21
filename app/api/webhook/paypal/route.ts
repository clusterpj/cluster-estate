import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { BookingStatus, PaymentStatus } from '@/types/booking-status'
import { verifyPayPalWebhook } from '@/lib/paypal'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

interface PayPalResource {
  id: string
  custom_id?: string
  refund_id?: string
  [key: string]: unknown
}

interface PayPalWebhookPayload extends Record<string, unknown> {
  event_type: string
  resource: PayPalResource
}

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const headersList = headers()
  let webhookEventId: string | null = null
  
  try {
    // 1. Extract webhook data
    const payload = (await req.json()) as PayPalWebhookPayload
    const transmissionId = headersList.get('paypal-transmission-id')
    const timestamp = headersList.get('paypal-transmission-time')
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const eventType = payload.event_type
    
    // 2. Store webhook event
    const { data: webhookEvent, error: webhookError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: eventType,
        payload,
        processed: false
      })
      .select()
      .single()
      
    if (webhookError) {
      console.error('Error storing webhook event:', webhookError)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    webhookEventId = webhookEvent.id

    // 3. Verify webhook signature
    if (!transmissionId || !timestamp || !webhookId) {
      throw new Error('Missing required webhook headers')
    }

    const isValid = await verifyPayPalWebhook({
      transmissionId,
      timestamp,
      webhookId,
      eventBody: payload
    })

    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // 4. Process different event types
    const resourceId = payload.resource.id // PayPal payment ID
    const bookingId = payload.resource.custom_id // Our booking ID

    if (!bookingId) {
      throw new Error('Missing booking ID in PayPal webhook')
    }

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await updateBookingStatus(supabase, {
          bookingId,
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentId: resourceId,
          reason: 'Payment completed successfully'
        })
        break

      case 'PAYMENT.CAPTURE.DENIED':
        await updateBookingStatus(supabase, {
          bookingId,
          status: BookingStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
          paymentId: resourceId,
          reason: 'Payment was denied'
        })
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await updateBookingStatus(supabase, {
          bookingId,
          status: BookingStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED,
          paymentId: resourceId,
          refundId: payload.resource.refund_id,
          reason: 'Payment was refunded'
        })
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    // 5. Mark webhook event as processed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookEventId)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    
    // Store error in webhook events table if we have a webhook event ID
    if (webhookEventId && error instanceof Error) {
      await supabase
        .from('webhook_events')
        .update({
          error: error.message,
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookEventId)
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function updateBookingStatus(
  supabase: SupabaseClient<Database>,
  {
    bookingId,
    status,
    paymentStatus,
    paymentId,
    refundId,
    reason
  }: {
    bookingId: string
    status: BookingStatus
    paymentStatus: PaymentStatus
    paymentId?: string
    refundId?: string
    reason?: string
  }
) {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status, payment_status')
    .eq('id', bookingId)
    .single()

  if (fetchError) throw fetchError

  // Insert status history record
  await supabase.from('booking_status_history').insert({
    booking_id: bookingId,
    old_status: booking.status,
    new_status: status,
    old_payment_status: booking.payment_status,
    new_payment_status: paymentStatus,
    payment_id: paymentId,
    refund_id: refundId,
    reason
  })

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status,
      payment_status: paymentStatus,
      payment_id: paymentId,
      refund_id: refundId,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  if (updateError) throw updateError
}