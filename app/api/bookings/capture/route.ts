import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { BookingStatus } from '@/types/booking-status'

export async function POST(req: Request) {
  const supabase = createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    )
  }

  try {
    const { orderId, bookingId } = await req.json()

    // 1. Capture PayPal payment
    const captureData = await capturePayPalOrder(orderId)
    
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment capture failed' },
        { status: 402 }
      )
    }

    // 2. Update booking status in Supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: BookingStatus.AWAITING_APPROVAL,
        payment_id: captureData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Booking update failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      bookingId,
      captureId: captureData.id
    })

  } catch (error) {
    console.error('Capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}