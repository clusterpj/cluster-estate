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
    console.log('Initializing PayPal SDK...')
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`
    script.async = true
    script.setAttribute('data-sdk-integration-source', 'integrationbuilder_sc')
    script.setAttribute('data-namespace', 'paypal_sdk')
    script.setAttribute('data-client-token', 'paypal-client-token')
    script.setAttribute('data-csp-nonce', 'paypal-nonce')

    script.onload = () => {
      console.log('PayPal SDK loaded successfully')
      setIsPayPalReady(true)
      setIsLoading(false)
      onInit?.()
    }

    script.onerror = () => {
      console.error('Failed to load PayPal SDK')
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
      console.log('Cleaning up PayPal SDK')
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
            console.log('Creating PayPal order...')
          createOrder={(data, actions) => {
            try {
              setIsCreatingOrder(true)
              return actions.order.create({
              const order = await actions.order.create({
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
              console.log('PayPal order created successfully:', order)
              return order
            } catch (err) {
              console.error('Error creating PayPal order:', err)
              setError('Failed to create payment order')
              setIsCreatingOrder(false)
              throw err
            } finally {
              setIsCreatingOrder(false)
            }
          }}
          onApprove={async (data, actions) => {
            console.log('PayPal payment approved:', data)
            try {
              await actions.order?.capture()
              console.log('Capturing PayPal payment...')
              const captureData = await actions.order?.capture()
              console.log('Payment captured successfully:', captureData)
              await onApprove(data)
            } catch (error) {
              console.error('Error capturing payment:', error)
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
            console.error('PayPal payment error:', error)
            setError('Payment system error')
            toast({
              variant: 'destructive',
              title: 'Payment Error',
              description: error.message || 'Payment failed'
            })
            onError(error)
          }}
          onCancel={() => {
            console.log('PayPal payment cancelled by user')
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
