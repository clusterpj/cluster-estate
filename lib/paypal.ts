import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { PayPalBookingData } from '@/types/booking'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PayPalOrderData {
  intent: string
  purchase_units: {
    amount: {
      currency_code: string
      value: string
    }
    description: string
    custom_id: string
    invoice_id: string
  }[]
  application_context: {
    brand_name: string
    user_action: string
    return_url: string
    cancel_url: string
  }
}

export async function createPayPalOrder(orderData: PayPalOrderData) {
  try {
    // Ensure we have a valid access token
    if (!process.env.PAYPAL_ACCESS_TOKEN) {
      throw new Error('PayPal access token is missing')
    }

    // Validate order data
    if (!orderData || !orderData.purchase_units || orderData.purchase_units.length === 0) {
      throw new Error('Invalid order data')
    }

    // Ensure amount value is properly formatted
    const purchaseUnit = orderData.purchase_units[0]
    if (!purchaseUnit.amount || typeof purchaseUnit.amount.value !== 'string') {
      throw new Error('Invalid amount format')
    }

    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error('Failed to create PayPal order')
    }

    const order = await response.json()
    return order
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    throw error
  }
}

export async function capturePayPalOrder(orderId: string) {
  try {
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to capture PayPal order')
    }

    const captureData = await response.json()
    return captureData
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    throw error
  }
}

export async function createBooking(bookingData: PayPalBookingData, userId: string) {
  const { data: property } = await supabase
    .from('properties')
    .select('rental_price, rental_frequency')
    .eq('id', bookingData.propertyId)
    .single()

  if (!property) {
    throw new Error('Property not found')
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([
      {
        property_id: bookingData.propertyId,
        user_id: userId,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        total_price: bookingData.totalPrice,
        special_requests: bookingData.specialRequests,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return booking
}

export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentId: string,
  status: 'completed' | 'failed'
) {
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_id: paymentId,
      payment_status: status,
      status: status === 'completed' ? 'confirmed' : 'cancelled',
    })
    .eq('id', bookingId)

  if (error) {
    throw error
  }
}
