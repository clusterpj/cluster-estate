import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookingForm } from './BookingForm'
import { PayPalButton } from './PayPalButton'
import { Property } from '@/types/property'
import { BookingFormData, PayPalBookingData } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateTotalPrice } from '@/lib/utils'

interface PropertyBookingProps {
  property: Property
}

export function PropertyBooking({ property }: PropertyBookingProps) {
  const router = useRouter()
  const [bookingStep, setBookingStep] = useState<'form' | 'payment'>('form')
  const [bookingData, setBookingData] = useState<PayPalBookingData | null>(null)

  const handleBookingSubmit = (data: BookingFormData) => {
    // Calculate total price based on dates and property price
    const totalPrice = calculateTotalPrice({
      checkIn: data.check_in,
      checkOut: data.check_out,
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
        ) : bookingData ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p>Check-in: {bookingData.check_in.toLocaleDateString()}</p>
              <p>Check-out: {bookingData.check_out.toLocaleDateString()}</p>
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
        ) : null}
      </CardContent>
    </Card>
  )
}