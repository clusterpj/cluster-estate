import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookingForm } from './BookingForm'
import { PayPalButton } from './PayPalButton'
import { Property } from '@/types/property'
import { BookingFormData, PayPalBookingData } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateTotalPrice } from '@/lib/utils'
import { loadScript } from '@paypal/paypal-js'

interface PropertyBookingProps {
  property: Property
}

export function PropertyBooking({ property }: PropertyBookingProps) {
  const router = useRouter()
  const [bookingStep, setBookingStep] = useState<'form' | 'payment'>('form')
  const [bookingData, setBookingData] = useState<PayPalBookingData | null>(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  useEffect(() => {
    // Load PayPal script when component mounts
    const loadPayPal = async () => {
      try {
        await loadScript({ 
          'clientId': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: 'USD'
        })
        setPaypalLoaded(true)
      } catch (error) {
        console.error('Failed to load PayPal SDK:', error)
      }
    }

    loadPayPal()

    // Cleanup function
    return () => {
      setPaypalLoaded(false)
    }
  }, [])

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

  const handlePaymentSuccess = (bookingId: string) => {
    // Redirect to booking confirmation page
    router.push(`/bookings/${bookingId}`)
  }

  const handlePaymentError = () => {
    // Reset to form step
    setBookingStep('form')
    setBookingData(null)
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
        ) : bookingData && paypalLoaded ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p>Check-in: {bookingData.checkIn.toLocaleDateString()}</p>
              <p>Check-out: {bookingData.checkOut.toLocaleDateString()}</p>
              <p>Guests: {bookingData.guests}</p>
              <p className="font-semibold">
                Total: ${bookingData.totalPrice.toFixed(2)}
              </p>
            </div>
            <PayPalButton
              bookingData={bookingData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        ) : (
          <p>Loading payment options...</p>
        )}
      </CardContent>
    </Card>
  )
}
