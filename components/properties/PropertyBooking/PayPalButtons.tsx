'use client'

import React from 'react'
import { PayPalButtons as PayPalButtonsBase, usePayPalScriptReducer, DISPATCH_ACTION } from '@paypal/react-paypal-js'
import { useState, useEffect } from 'react'
import type { GuestPayPalButtonsProps, PayPalAuthorization } from '@/types/paypal'

export const EnhancedPayPalButtons = ({
  totalPrice,
  currency = 'USD',
  onApprove,
  onError,
  onCancel,
  guestInfo,
  isGuestCheckout = false,
}: GuestPayPalButtonsProps) => {
  const [{ isPending, isRejected }, dispatch] = usePayPalScriptReducer()
  const [error, setError] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  useEffect(() => {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        'disable-funding': 'credit',
        'enable-funding': 'paypal,venmo,card',
        components: 'buttons,hosted-fields',
        intent: 'authorize'
      }
    })
  }, [currency, dispatch])

  if (isPending) {
    return <div className="w-full p-4 text-center text-gray-500">Loading PayPal...</div>
  }

  if (isRejected || error) {
    return <div className="w-full p-4 text-center text-red-500">Payment system error: {error || 'Failed to load PayPal'}</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <PayPalButtonsBase
          style={{ layout: 'vertical', label: 'checkout' }}
          createOrder={(_, actions) => {
            try {
              setIsCreatingOrder(true)
              return actions.order.create({
                intent: "AUTHORIZE",
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
                }],
                ...(isGuestCheckout && guestInfo ? {
                  payer: {
                    email_address: guestInfo.email,
                    name: {
                      given_name: guestInfo.name.split(' ')[0] || '',
                      surname: guestInfo.name.split(' ').slice(1).join(' ') || ''
                    }
                  }
                } : {})
              })
            } catch (err) {
              setError('Failed to create payment order')
              throw err
            } finally {
              setIsCreatingOrder(false)
            }
          }}
          onApprove={async (data, actions) => {
            try {
              if (!actions.order) throw new Error('Payment actions not available')
              const authorization = await actions.order.authorize() as unknown as PayPalAuthorization
              
              const authId = authorization?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id
              if (!authId) {
                throw new Error('Payment authorization failed')
              }

              await onApprove(
                { 
                  orderID: data.orderID, 
                  payerID: data.payerID || undefined 
                },
                { 
                  order: {
                    authorize: () => Promise.resolve(authorization),
                    capture: actions.order.capture
                  }
                }
              )
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Payment failed'
              setError(errorMessage)
              onError({ message: errorMessage })
            }
          }}
          onError={(error) => {
            setError('Payment system error')
            onError(error)
          }}
          onCancel={() => {
            setError('Payment canceled')
            onCancel?.()
          }}
          forceReRender={[totalPrice, currency]}
          disabled={isCreatingOrder}
        />
        {isCreatingOrder && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-sm text-gray-500">Processing your payment...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedPayPalButtons
