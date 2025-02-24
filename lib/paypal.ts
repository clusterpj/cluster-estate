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

export async function capturePayPalPayment(authorizationId: string) {
  try {
    const apiUrl = process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // Capture the authorized payment
    const response = await fetch(
      `${apiUrl}/v2/payments/authorizations/${authorizationId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
          'PayPal-Request-Id': `capture_${authorizationId}`,
        },
        body: JSON.stringify({
          final_capture: true
        })
      }
    );

    let data;
    const responseText = await response.text();
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error('Failed to parse PayPal response:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        authorizationId
      });
      return {
        success: false,
        error: `Invalid response from PayPal: ${response.statusText}`
      };
    }

    if (!response.ok) {
      console.error('PayPal capture error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        authorizationId,
        responseText
      });
      return {
        success: false,
        error: data?.message || `Failed to capture payment: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function voidPayPalPayment(authorizationId: string) {
  try {
    const apiUrl = process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // Void the authorized payment
    const response = await fetch(
      `${apiUrl}/v2/payments/authorizations/${authorizationId}/void`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
          'PayPal-Request-Id': `void_${authorizationId}`,
        },
        body: JSON.stringify({}) 
      }
    );

    let data;
    const responseText = await response.text();
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error('Failed to parse PayPal response:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        authorizationId
      });
      return {
        success: false,
        error: `Invalid response from PayPal: ${response.statusText}`
      };
    }

    if (!response.ok) {
      console.error('PayPal void error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        authorizationId,
        responseText
      });
      return {
        success: false,
        error: data?.message || `Failed to void payment: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error voiding PayPal payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
