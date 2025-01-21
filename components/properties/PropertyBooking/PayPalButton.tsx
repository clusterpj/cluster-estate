import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { PayPalBookingData } from '@/types/booking'

interface PayPalButtonProps {
  bookingData: PayPalBookingData
  onSuccess: (bookingId: string) => void
  onError: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const paypal: any;

export function PayPalButton({ bookingData, onSuccess, onError }: PayPalButtonProps) {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paypalButtonsRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      console.error('PayPal client ID is not configured')
      return
    }

    const loadPayPalScript = async () => {
      // Check for existing script first
      let script = document.querySelector('script[src*="paypal.com/sdk/js"]') as HTMLScriptElement | null
      
      if (!script) {
        script = document.createElement('script') as HTMLScriptElement
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
        script.async = true
        script.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load PayPal payment system',
          })
        }
        document.body.appendChild(script)
      }

      // Handle both existing and new script
      if ((script as HTMLScriptElement).onload) {
        (script as HTMLScriptElement).onload = () => initializePayPalButton()
      } else {
        script.addEventListener('load', () => initializePayPalButton())
      }
    }

    const initializePayPalButton = () => {
      paypal.Buttons({
        createOrder: async () => {
          try {
            const response = await fetch('/api/bookings/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bookingData),
            })

            if (!response.ok) {
              throw new Error('Failed to create booking')
            }

            const data = await response.json()
            if (!data.paypalOrderId) {
              throw new Error('Missing PayPal order ID in response')
            }
            return data.paypalOrderId
          } catch (error) {
            console.error('Error creating order:', error)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to create booking. Please try again.',
            })
            onError()
            throw error
          }
        },
        onApprove: async (data: { orderID: string }) => {
          try {
            const response = await fetch('/api/bookings/capture', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.orderID,
                bookingId: bookingData.propertyId,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to capture payment')
            }

            const captureData = await response.json()
            
            toast({
              title: 'Success',
              description: 'Your booking has been confirmed!',
            })
            
            onSuccess(captureData.bookingId)
          } catch (error) {
            console.error('Error capturing payment:', error)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to confirm booking. Please contact support.',
            })
            onError()
          }
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'PayPal payment failed. Please try again.',
          })
          onError()
        }
      }).render('#paypal-button-container')
    }

    loadPayPalScript()

    return () => {
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]')
      if (script && script.parentNode === document.body) {
        document.body.removeChild(script)
      }
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current.close()
      }
    }
  }, [bookingData, onSuccess, onError, toast])

  return <div id="paypal-button-container" className="w-full max-w-md mx-auto" />
}
