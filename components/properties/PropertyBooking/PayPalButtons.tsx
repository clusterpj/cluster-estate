'use client'

import React from 'react'
import { PayPalButtons, usePayPalScriptReducer, DISPATCH_ACTION } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'

interface PayPalButtonsProps {
  totalPrice: number
  currency?: string
  onApprove: (
    data: { orderID: string; payerID?: string }, 
    actions: {
      order: {
        capture: () => Promise<{
          status: string;
          id: string;
          payer: Record<string, unknown>;
        }>;
      };
    }
  ) => Promise<void>
  onError: (error: { message?: string; details?: Record<string, unknown> }) => void
  onCancel?: () => void
}

export function PayPalButtonsWrapper({
  totalPrice,
  currency = 'USD',
  onApprove,
  onError,
  onCancel,
}: PayPalButtonsProps): React.ReactNode {
  const { toast } = useToast()
  const [{ isPending, isRejected }, dispatch] = usePayPalScriptReducer()
  const [error, setError] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  useEffect(() => {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        'disable-funding': 'credit,card',
        'enable-funding': 'paypal'
      }
    })
  }, [currency, dispatch])

  if (isPending) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading PayPal...
      </div>
    );
  }

  if (isRejected || error) {
    return (
      <div className="w-full p-4 text-center text-red-500">
        Payment system error: {error || 'Failed to load PayPal'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <PayPalButtons
          style={{ layout: 'vertical', label: 'checkout' }}
          createOrder={(data, actions) => {
            console.log('Creating PayPal order...')
            try {
              setIsCreatingOrder(true)
              return actions.order.create({
                intent: "CAPTURE",
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
              console.error('Error creating PayPal order:', err)
              setError('Failed to create payment order')
              throw err
            } finally {
              setIsCreatingOrder(false)
            }
          }}
          onApprove={async (data: { orderID: string; payerID?: string }, actions) => {
            console.log('PayPal payment approved:', data)
            try {
              console.log('Capturing PayPal payment...')
              const captureData = await actions.order?.capture()
              console.log('Payment captured successfully:', captureData)
              await onApprove(data)
            } catch (error: unknown) {
              console.error('Error capturing payment:', error)
              setError('Payment processing failed')
              toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: String('There was an error processing your payment')
              })
              onError({ message: error instanceof Error ? error.message : 'Unknown error' })
            }
          }}
          onError={(error: { message?: string }) => {
            console.error('PayPal payment error:', error)
            setError('Payment system error')
            toast({
              variant: 'destructive',
              title: 'Payment Error',
              description: String(error.message || 'Payment failed')
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
        {isCreatingOrder && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-sm text-gray-500">
              Processing your payment...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
