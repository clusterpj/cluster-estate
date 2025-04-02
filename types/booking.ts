import { BookingStatus, PaymentStatus } from './booking-status';
import { Database } from './database.types';

// Define the Booking type based on the database schema
export type Booking = Database['public']['Tables']['bookings']['Row'];

// Extended booking type with additional properties that might be joined from other tables
export interface ExtendedBooking extends Booking {
  property_name?: string;
  user_email?: string;
  total_nights?: number;
  guest_name?: string;
}

// Booking creation payload
export interface CreateBookingPayload {
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
}

// Booking update payload
export interface UpdateBookingPayload {
  check_in?: string;
  check_out?: string;
  guests?: number;
  total_amount?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  cancellation_reason?: string;
  cancellation_date?: string;
}

export type NewBooking = Database['public']['Tables']['bookings']['Insert']
export type UpdateBooking = Database['public']['Tables']['bookings']['Update']

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
  // Use the same type as in the base Booking type
  // status is already defined in the base Booking type
  payment_status: PaymentStatus
  payment_id: string | null
  special_requests: string | null
  check_in: string
  check_out: string
  guests: number
  total_price: number
}