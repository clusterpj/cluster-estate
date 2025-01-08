export const BookingPaymentStatus = {
  PENDING: 'pending',
  CREATED: 'created',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type BookingPaymentStatus = typeof BookingPaymentStatus[keyof typeof BookingPaymentStatus]

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus]
