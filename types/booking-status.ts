export type BookingStatus = 
  | 'pending'
  | 'awaiting-approval'
  | 'confirmed'
  | 'canceled'
  | 'completed'

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'completed'
  | 'failed'
  | 'refunded'

export interface StatusUpdate {
  bookingId: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentId?: string
  refundId?: string
  reason?: string
}

export interface StatusHistoryEntry {
  id: string
  bookingId: string
  oldStatus: BookingStatus
  newStatus: BookingStatus
  oldPaymentStatus: PaymentStatus
  newPaymentStatus: PaymentStatus
  reason?: string
  createdAt: Date
}
