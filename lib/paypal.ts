import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { PayPalBookingData } from '@/types/booking'
import { BookingPaymentStatus, BookingStatus } from '@/types/booking-status'

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

import { config } from './config'

async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(
      `${config.paypal.clientId}:${config.paypal.clientSecret}`
    ).toString('base64')

    console.log('Fetching PayPal access token...')
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PayPal token request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      throw new Error(`PayPal token request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('No access token in PayPal response')
    }

    console.log('Successfully obtained PayPal access token')
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', {
      error,
      clientIdPresent: !!process.env.PAYPAL_CLIENT_ID,
      secretPresent: !!process.env.PAYPAL_SECRET
    })
    throw new Error(`Failed to get PayPal access token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function createPayPalOrder(orderData: PayPalOrderData) {
  try {
    console.log('Starting PayPal order creation...')
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      throw new Error('No access token received from PayPal')
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

    console.log('Sending PayPal order request...')
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PayPal order creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      throw new Error(`PayPal order creation failed: ${response.status} ${response.statusText}`)
    }

    const order = await response.json()
    if (!order.id) {
      throw new Error('No order ID in PayPal response')
    }

    console.log('PayPal order created successfully:', order.id)
    return order
  } catch (error) {
    console.error('Error creating PayPal order:', {
      error,
      orderData: {
        ...orderData,
        purchase_units: orderData.purchase_units.map(unit => ({
          ...unit,
          amount: unit.amount.value
        }))
      }
    })
    throw new Error(`Failed to create PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function capturePayPalOrder(orderId: string) {
  try {
    const accessToken = await getPayPalAccessToken()
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
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
        status: BookingStatus.PENDING,
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
  status: BookingPaymentStatus.COMPLETED | BookingPaymentStatus.FAILED
) {
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_id: paymentId,
      payment_status: status,
      status: status === BookingPaymentStatus.COMPLETED ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED,
    })
    .eq('id', bookingId)

  if (error) {
    throw error
  }
}
