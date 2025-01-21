export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

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
