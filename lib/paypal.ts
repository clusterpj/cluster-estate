interface PayPalWebhookVerification {
  transmissionId: string
  timestamp: string
  webhookId: string
  eventBody: Record<string, unknown>
}

export async function verifyPayPalWebhook({
  transmissionId,
  timestamp,
  webhookId,
  eventBody,
}: PayPalWebhookVerification): Promise<boolean> {
  try {
    // Get PayPal webhook signature
    const apiUrl = process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${apiUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: timestamp,
        webhook_id: webhookId,
        webhook_event: eventBody,
      }),
    })

    const data = await response.json()
    return data.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('PayPal webhook verification failed:', error)
    return false
  }
}

export async function createPayPalOrder(orderData: any) {
  try {
    console.log('Creating PayPal order with data:', orderData)
    
    // Use the correct API URL
    const apiUrl = process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    console.log('Using PayPal API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestData: orderData
      })
      throw new Error(`PayPal API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('PayPal order created successfully:', data)
    
    return {
      id: data.id,
      status: data.status,
      links: data.links
    }
  } catch (error) {
    console.error('Failed to create PayPal order:', error)
    throw error
  }
}

export async function capturePayPalOrder(orderId: string) {
  try {
    const apiUrl = process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${apiUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal capture error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        orderId
      })
      throw new Error(`PayPal capture error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      status: data.status,
    }
  } catch (error) {
    console.error('PayPal order capture failed:', error)
    throw error
  }
}
