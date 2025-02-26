import { Database } from './database.types'

export type Booking = Database['public']['Tables']['bookings']['Row']
export type NewBooking = Database['public']['Tables']['bookings']['Insert']
export type UpdateBooking = Database['public']['Tables']['bookings']['Update']

export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'expired' | 'payment_failed' 
export type PaymentStatus = 'pending' | 'captured' | 'completed' | 'failed' | 'refunded'

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

export interface BookingWithProperty extends Booking {
  property: {
    id: string
    title: string
    location?: string
  }
  status: BookingStatus
  payment_status: PaymentStatus
  payment_id: string | null
  special_requests: string | null
  check_in: string
  check_out: string
  guests: number
  total_price: number
}