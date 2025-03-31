'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PayPalButtons from './PayPalButtons'
import { BookingFormData } from '@/types/booking'
import { Property } from '@/types/property'

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingData: BookingFormData & { totalPrice: number }
  property: Property
  onPaymentSuccess: (paypalData: { 
    orderID: string 
    payerID?: string 
    authorizationID?: string 
    status?: string 
  }) => Promise<void>
  onPaymentError: (error: { message?: string }) => void
  onPaymentCancel: () => void
  isProcessing: boolean
}

export function PaymentDialog({
  isOpen,
  onClose,
  bookingData,
  property,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  isProcessing
}: PaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] p-0 sm:p-6">
        <DialogHeader className="px-4 sm:px-0">
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-6 p-4 sm:p-0">
          {/* Booking Summary - Left Side on Desktop */}
          <div className="sm:w-1/2 bg-gray-50 rounded-md p-4">
            <h3 className="font-semibold mb-4 text-lg">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span>{bookingData.checkIn.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span>{bookingData.checkOut.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span>{bookingData.guests}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-600">Price per night:</span>
                <span>${property.rental_price}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${bookingData.totalPrice}</span>
              </div>
            </div>
            
            {bookingData.specialRequests && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Special Requests:</h4>
                <p className="text-gray-600 text-sm">{bookingData.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Payment Section - Right Side on Desktop */}
          <div className="sm:w-1/2">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
              
              {isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Processing your booking...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <PayPalButtons
                    totalPrice={bookingData.totalPrice}
                    currency="USD"
                    onApprove={onPaymentSuccess}
                    onError={onPaymentError}
                    onCancel={onPaymentCancel}
                  />
                  <button
                    onClick={onClose}
                    className="w-full p-2 text-gray-600 hover:text-gray-800 text-center"
                  >
                    Back to Booking Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
