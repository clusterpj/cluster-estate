'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'

interface PayPalButtonsProps {
  totalPrice: number
  currency?: string
  onApprove: (data: any) => Promise<void>
  onError: (error: any) => void
}

export function PayPalButtonsWrapper({
  totalPrice,
  currency = 'USD',
  onApprove,
  onError
}: PayPalButtonsProps) {
  const { toast } = useToast()

  return (
    <PayPalScriptProvider 
      options={{
        'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        'disable-funding': 'card,venmo',
        'data-sdk-integration-source': 'integrationbuilder_sc'
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: totalPrice.toString(),
                currency_code: currency
              }
            }]
          })
        }}
        onApprove={async (data, actions) => {
          try {
            await actions.order?.capture()
            await onApprove(data)
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Payment Error',
              description: 'There was an error processing your payment'
            })
            onError(error)
          }
        }}
        onError={(error) => {
          toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: error.message || 'Payment failed'
          })
          onError(error)
        }}
      />
    </PayPalScriptProvider>
  )
}
