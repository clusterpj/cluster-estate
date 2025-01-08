import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { PayPalBookingData } from '@/types/booking'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentFormProps {
  bookingData: PayPalBookingData
  onSuccess: (bookingId: string) => void
  onError: () => void
}

export function PaymentForm({ bookingData, onSuccess, onError }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      // Create booking first
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
      
      toast({
        title: 'Success',
        description: 'Your booking has been confirmed!',
      })
      
      onSuccess(data.bookingId)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
      })
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <p>Check-in: {bookingData.checkIn.toLocaleDateString()}</p>
            <p>Check-out: {bookingData.checkOut.toLocaleDateString()}</p>
            <p>Guests: {bookingData.guests}</p>
            <p className="font-semibold mt-2">
              Total: ${bookingData.totalPrice.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Confirm and Pay'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}