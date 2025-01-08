import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { PayPalBookingData } from '@/types/booking'

interface PayPalButtonProps {
  bookingData: PayPalBookingData
  onSuccess: (bookingId: string) => void
  onError: () => void
}

declare const paypal: any;

export function PayPalButton({ bookingData, onSuccess, onError }: PayPalButtonProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      console.error('PayPal client ID is not configured')
      return
    }

    const loadPayPalScript = async () => {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
      script.async = true
      script.onload = () => {
        initializePayPalButton()
      }
      document.body.appendChild(script)
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
      if (script) {
        document.body.removeChild(script)
      }
    }
  }, [bookingData, onSuccess, onError, toast])

  return <div id="paypal-button-container" className="w-full max-w-md mx-auto" />
}