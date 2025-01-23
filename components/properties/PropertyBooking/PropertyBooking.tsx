import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookingForm } from './BookingForm'
import { PayPalButtonsWrapper } from './PayPalButtons'
import { Property } from '@/types/property'
import { BookingFormData, PayPalBookingData } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateTotalPrice } from '@/lib/utils'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'

interface PropertyBookingProps {
  property: Property
}

export function PropertyBooking({ property }: PropertyBookingProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [bookingStep, setBookingStep] = useState<'form' | 'payment'>('form')
  const [bookingData, setBookingData] = useState<PayPalBookingData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBookingSubmit = (data: BookingFormData) => {
    // Calculate total price based on dates and property price
    const totalPrice = calculateTotalPrice({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      rentalPrice: property.rental_price!,
      rentalFrequency: property.rental_frequency!,
    })

    const paypalBookingData: PayPalBookingData = {
      ...data,
      propertyId: property.id,
      totalPrice,
    }

    setBookingData(paypalBookingData)
    setBookingStep('payment')
  }

  const handlePaymentSuccess = async (paypalData: any) => {
    if (!bookingData) {
      console.error('No booking data available')
      return
    }

    setIsProcessing(true)

    try {
      // Create the booking in your database
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          propertyId: bookingData.propertyId,
          totalPrice: bookingData.totalPrice,
          paymentId: paypalData.orderID,
          paymentStatus: paypalData.paymentStatus,
          payerDetails: {
            id: paypalData.payerID,
            source: paypalData.paymentSource
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to create booking')
      }

      const { booking } = await response.json()
      
      // Redirect to the booking confirmation page
      router.push(`/en/bookings/${booking.id}`)
      
      toast({
        title: 'Booking Confirmed',
        description: 'Your booking has been successfully confirmed.',
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: error instanceof Error ? error.message : 'Failed to create booking',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = () => {
    // Reset to form step
    setBookingStep('form')
    setBookingData(null)
    toast({
      variant: 'destructive',
      title: 'Payment Failed',
      description: 'There was an error processing your payment. Please try again.',
    })
  }

  const handlePaymentCancel = () => {
    // Reset to form step
    setBookingStep('form')
    setBookingData(null)
    toast({
      title: 'Payment Cancelled',
      description: 'You have cancelled the payment process.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {bookingStep === 'form' ? 'Book Your Stay' : 'Complete Payment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookingStep === 'form' ? (
          <BookingForm
            property={property}
            onSubmit={handleBookingSubmit}
          />
        ) : bookingData ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p>Check-in: {bookingData.checkIn.toLocaleDateString()}</p>
              <p>Check-out: {bookingData.checkOut.toLocaleDateString()}</p>
              <p>Guests: {bookingData.guests}</p>
              <p className="font-semibold">
                Total: ${bookingData.totalPrice.toFixed(2)}
              </p>
            </div>
            {isProcessing ? (
              <div className="w-full p-4 text-center text-gray-500">
                Processing your booking...
              </div>
            ) : (
              <PayPalButtonsWrapper
                totalPrice={bookingData.totalPrice}
                currency="USD"
                onApprove={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
