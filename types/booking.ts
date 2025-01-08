import { Database } from './database.types'

export type Booking = Database['public']['Tables']['bookings']['Row']
export type NewBooking = Database['public']['Tables']['bookings']['Insert']
export type UpdateBooking = Database['public']['Tables']['bookings']['Update']

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface BookingFormData {
  checkIn: Date
  checkOut: Date
  guests: number
  specialRequests?: string
}

export interface PayPalBookingData extends BookingFormData {
  propertyId: string
  totalPrice: number
}

export interface CreateBookingResponse {
  bookingId: string
  paypalOrderId: string
}

export interface CompleteBookingResponse {
  success: boolean
  bookingId: string
  error?: string
}