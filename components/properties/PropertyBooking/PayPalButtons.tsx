'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'

interface PayPalButtonsProps {
  totalPrice: number
  currency?: string
  onApprove: (data: any) => Promise<void>
  onError: (error: any) => void
  onCancel?: () => void
  onInit?: () => void
}

export function PayPalButtonsWrapper({
  totalPrice,
  currency = 'USD',
  onApprove,
  onError,
  onCancel,
  onInit
}: PayPalButtonsProps) {
  const { toast } = useToast()
  const [isPayPalReady, setIsPayPalReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`
    script.async = true
    script.setAttribute('data-sdk-integration-source', 'integrationbuilder_sc')
    script.setAttribute('data-namespace', 'paypal_sdk')
    script.setAttribute('data-client-token', 'paypal-client-token')
    script.setAttribute('data-csp-nonce', 'paypal-nonce')

    script.onload = () => {
      setIsPayPalReady(true)
      setIsLoading(false)
      onInit?.()
    }

    script.onerror = () => {
      setError('Failed to load PayPal SDK')
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to load payment system'
      })
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [currency, toast, onInit])

  return (
    <PayPalScriptProvider 
      options={{
        'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        'disable-funding': 'card,venmo'
      }}
    >
      {isLoading && <div>Loading PayPal...</div>}
      {error && (
        <div className="text-red-500">
          Payment system error: {error}
        </div>
      )}
      {isPayPalReady && !error && (
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={async (data, actions) => {
          createOrder={(data, actions) => {
            try {
              setIsCreatingOrder(true)
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: totalPrice.toString(),
                    currency_code: currency,
                    breakdown: {
                      item_total: {
                        value: totalPrice.toString(),
                        currency_code: currency
                      }
                    }
                  },
                  items: [{
                    name: 'Property Booking',
                    quantity: '1',
                    unit_amount: {
                      value: totalPrice.toString(),
                      currency_code: currency
                    }
                  }]
                }]
              })
            } catch (err) {
              setError('Failed to create payment order')
              setIsCreatingOrder(false)
              throw err
            } finally {
              setIsCreatingOrder(false)
            }
          }}
          onApprove={async (data, actions) => {
            try {
              await actions.order?.capture()
              await onApprove(data)
            } catch (error) {
              setError('Payment processing failed')
              toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: 'There was an error processing your payment'
              })
              onError(error)
            }
          }}
          onError={(error) => {
            setError('Payment system error')
            toast({
              variant: 'destructive',
              title: 'Payment Error',
              description: error.message || 'Payment failed'
            })
            onError(error)
          }}
          onCancel={() => {
            setError('Payment cancelled')
            onCancel?.()
          }}
          forceReRender={[totalPrice, currency]}
          disabled={isCreatingOrder}
        />
      )}
    </PayPalScriptProvider>
  )
}
