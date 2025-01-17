export const BookingPaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export type BookingPaymentStatus = typeof BookingPaymentStatus[keyof typeof BookingPaymentStatus]

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus]

// Type guards for status validation
export function isValidPaymentStatus(status: string): status is BookingPaymentStatus {
  return Object.values(BookingPaymentStatus).includes(status as BookingPaymentStatus)
}

export function isValidBookingStatus(status: string): status is BookingStatus {
  return Object.values(BookingStatus).includes(status as BookingStatus)
}

// Status transition validation
export function canTransitionPaymentStatus(
  current: BookingPaymentStatus,
  next: BookingPaymentStatus
): boolean {
  const validTransitions: Record<BookingPaymentStatus, BookingPaymentStatus[]> = {
    pending: ['completed', 'failed', 'refunded'],
    completed: ['refunded'],
    failed: [],
    refunded: []
  }

  return validTransitions[current].includes(next)
}

export function getBookingStatusForPaymentStatus(
  paymentStatus: BookingPaymentStatus
): BookingStatus {
  switch (paymentStatus) {
    case 'completed':
      return 'confirmed'
    case 'failed':
    case 'refunded':
      return 'cancelled'
    default:
      return 'pending'
  }
}
