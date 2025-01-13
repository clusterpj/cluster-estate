import { type ReactNode, useEffect } from 'react'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

interface PayPalProviderProps {
  children: ReactNode
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  useEffect(() => {
    if (!clientId) {
      console.warn(
        'PayPal client ID is not configured. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your environment variables.'
      )
    }
  }, [clientId])

  if (!clientId) {
    return children
  }

  const paypalOptions = {
    'client-id': clientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': 'credit,card',
    'enable-funding': 'paypal',
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  )
}
