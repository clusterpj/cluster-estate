import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { bookingId, orderId } = await request.json()

    console.log('Capturing payment for order:', orderId)

    if (!bookingId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get PayPal credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'PayPal configuration missing' },
        { status: 500 }
      )
    }

    // Get access token from PayPal
    console.log('Getting PayPal access token...')
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)

    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData)
      throw new Error('Failed to get PayPal access token')
    }

    // Capture the order
    console.log('Sending capture request to PayPal...')
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${bookingId}_${Date.now()}`, // Idempotency key
        },
      }
    )

    const captureData = await captureResponse.json()
    console.log('PayPal capture response:', captureData)

    if (!captureResponse.ok) {
      console.error('PayPal capture error:', captureData)
      return NextResponse.json(
        { 
          error: captureData.message || 'Failed to capture payment',
          details: captureData
        }, 
        { status: captureResponse.status }
      )
    }

    // Update booking status in database
    console.log('Updating booking status in database...')
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
        payment_details: {
          ...captureData,
          status: 'COMPLETED',
          capture_id: captureData.id,
          capture_status: captureData.status,
          capture_time: new Date().toISOString()
        }
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking status', details: updateError },
        { status: 500 }
      )
    }

    console.log('Payment capture completed successfully')
    return NextResponse.json({ 
      success: true,
      message: 'Payment captured successfully',
      captureDetails: captureData
    })
  } catch (error) {
    console.error('Error capturing payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to capture payment' },
      { status: 500 }
    )
  }
}
