'use client'

import React from 'react'
import PayPalButtons from './PayPalButtons'
import { BookingForm } from './BookingForm'
import { Property } from '@/types/property'
import { BookingFormData } from '@/types/booking'

interface PayPalPaymentData {
  orderID: string
  payerID?: string
  authorizationID?: string
  status?: string
}

interface PropertyBookingProps {
  property: Property
}

export function PropertyBooking({ property }: PropertyBookingProps) {
  const [bookingData, setBookingData] = React.useState<BookingFormData & { totalPrice: number } | null>(null)
  const [bookingError, setBookingError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const calculateTotalPrice = (formData: BookingFormData): number => {
    if (!property.rental_price) {
      throw new Error('Property rental price is not set')
    }

    const nights = Math.ceil(
      (formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalPrice = nights * property.rental_price * formData.guests
    return totalPrice
  }

  const handleBookingSubmit = (formData: BookingFormData) => {
    try {
      const totalPrice = calculateTotalPrice(formData)
      setBookingData({ ...formData, totalPrice })
      setBookingError(null)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to calculate price')
    }
  }

  const handlePaymentSuccess = async (paypalData: PayPalPaymentData) => {
    if (!bookingData) return

    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
          specialRequests: bookingData.specialRequests,
          paymentDetails: paypalData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create booking')
      }

      const booking = await response.json()
      window.location.href = `/bookings/${booking.id}/confirmation`

    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to process booking')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: { message?: string }) => {
    setBookingError(error.message || 'Payment failed')
    setIsProcessing(false)
  }

  const handlePaymentCancel = () => {
    setBookingError('Payment cancelled')
    setIsProcessing(false)
  }

  if (!property.rental_price) {
    return (
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
          This property is not available for booking. Rental price is not set.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Book Your Stay</h2>
      
      {bookingError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-4">
          {bookingError}
        </div>
      )}

      {!bookingData ? (
        <BookingForm 
          property={property}
          onSubmit={handleBookingSubmit}
          isLoading={isProcessing}
        />
      ) : (
        <div>
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <p>Check-in: {bookingData.checkIn.toLocaleDateString()}</p>
            <p>Check-out: {bookingData.checkOut.toLocaleDateString()}</p>
            <p>Guests: {bookingData.guests}</p>
            <p className="mt-2">Price per night: ${property.rental_price}</p>
            <p className="font-bold mt-2">Total: ${bookingData.totalPrice}</p>
            {bookingData.specialRequests && (
              <div className="mt-2">
                <p className="font-semibold">Special Requests:</p>
                <p className="text-gray-600">{bookingData.specialRequests}</p>
              </div>
            )}
          </div>

          {isProcessing ? (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Processing your booking...</p>
            </div>
          ) : (
            <div>
              <PayPalButtons
                totalPrice={bookingData.totalPrice}
                currency="USD"
                onApprove={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
              <button
                onClick={() => setBookingData(null)}
                className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 text-center"
              >
                Back to Booking Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
