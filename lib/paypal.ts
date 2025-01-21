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
    const response = await fetch(`${process.env.PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
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

export async function capturePayPalOrder(orderId: string) {
  try {
    const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    })

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
