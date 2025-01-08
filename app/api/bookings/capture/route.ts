import { capturePayPalOrder, updateBookingPaymentStatus } from '@/lib/paypal'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { orderId, bookingId } = await request.json()

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Capture PayPal payment
    const captureData = await capturePayPalOrder(orderId)

    // Update booking status
    await updateBookingPaymentStatus(
      bookingId,
      captureData.id,
      captureData.status === 'COMPLETED' ? 'completed' : 'failed'
    )

    return NextResponse.json({
      success: true,
      bookingId,
      paymentId: captureData.id
    })
  } catch (error) {
    console.error('Error capturing payment:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
}