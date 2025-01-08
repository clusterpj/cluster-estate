import { type ReactNode } from 'react'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const paypalOptions = {
  'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
  currency: 'USD',
  intent: 'capture',
  components: 'buttons',
  'disable-funding': 'credit,card',
  'enable-funding': 'paypal',
}

interface PayPalProviderProps {
  children: ReactNode
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.error('PayPal client ID is not configured')
    return children
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  )
}