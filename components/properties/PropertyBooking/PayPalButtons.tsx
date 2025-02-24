'use client'

import React from 'react'
import { PayPalButtons, usePayPalScriptReducer, DISPATCH_ACTION } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'
import type { PayPalButtonsProps } from '@/types/paypal'

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
        'enable-funding': 'paypal',
        components: 'buttons,hosted-fields',
        intent: 'authorize'
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
            console.log('Creating PayPal order...', {
              totalPrice,
              currency
            })
            try {
              setIsCreatingOrder(true)
              return actions.order.create({
                intent: "authorize",
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
                  description: 'Property Booking (Pending Approval)',
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
              console.error('Error creating PayPal order:', {
                error: err,
                totalPrice,
                currency,
                data
              })
              setError('Failed to create payment order')
              toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Failed to create payment order. Please try again."
              })
              throw err
            } finally {
              setIsCreatingOrder(false)
            }
          }}
          onApprove={async (data, actions) => {
            console.log('PayPal payment approved:', data)
            try {
              if (!actions.order) {
                throw new Error('Payment actions not available')
              }

              console.log('Authorizing PayPal payment...')
              const authorizationData = await actions.order.authorize()
              console.log('Payment authorized successfully:', authorizationData)

              if (!authorizationData?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id) {
                throw new Error('Payment authorization failed - no authorization ID')
              }

              // Pass the PayPal data to the parent component
              await onApprove({
                orderID: data.orderID,
                status: 'AUTHORIZED',
                authorizationID: authorizationData.purchase_units[0].payments.authorizations[0].id,
                payerID: data.payerID,
                paymentSource: 'paypal',
                paymentDetails: authorizationData
              })

            } catch (error: unknown) {
              console.error('Error capturing payment:', error)
              setError('Payment processing failed')
              
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: `There was an error processing your payment: ${errorMessage}`
              })
              
              onError({ 
                message: errorMessage,
                details: error instanceof Error ? { stack: error.stack } : undefined
              })
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
            console.log('PayPal payment canceled by user')
            setError('Payment canceled')
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
