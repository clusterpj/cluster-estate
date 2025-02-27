import React from 'react'
import { Check, AlertCircle, Clock, Calendar, X } from 'lucide-react'

/**
 * Types for booking status and payment status
 */
export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'canceled' 
  | 'awaiting_approval'
  | 'awaiting-approval' // Support both underscore and hyphen versions
  | 'completed'

export type PaymentStatus = 
  | 'pending' 
  | 'authorized' 
  | 'completed' 
  | 'failed'
  | 'refunded'

/**
 * Interface for formatted status outputs
 */
export interface FormattedStatus {
  label: string
  className: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  icon?: React.ReactNode
  description?: string
}

/**
 * Gets formatted booking status with styling information
 */
export function formatBookingStatus(status: BookingStatus): FormattedStatus {
  const statusMap: Partial<Record<BookingStatus, FormattedStatus>> = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800',
      icon: React.createElement(Clock, { className: "h-4 w-4" }),
      description: 'Waiting for confirmation'
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-green-100 text-green-800',
      icon: React.createElement(Check, { className: "h-4 w-4" }),
      description: 'Booking is confirmed'
    },
    canceled: {
      label: 'Canceled',
      className: 'bg-red-100 text-red-800',
      icon: React.createElement(X, { className: "h-4 w-4" }),
      description: 'Booking was canceled'
    },
    awaiting_approval: {
      label: 'Awaiting Approval',
      className: 'bg-blue-100 text-blue-800',
      icon: React.createElement(Calendar, { className: "h-4 w-4" }),
      description: 'Waiting for admin approval'
    },
    'awaiting-approval': {
      label: 'Awaiting Approval',
      className: 'bg-blue-100 text-blue-800',
      icon: React.createElement(Calendar, { className: "h-4 w-4" }),
      description: 'Waiting for admin approval'
    },
    completed: {
      label: 'Completed',
      className: 'bg-gray-100 text-gray-800',
      icon: React.createElement(Check, { className: "h-4 w-4" }),
      description: 'Stay completed'
    }
  }

  return statusMap[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    className: 'bg-gray-100 text-gray-800'
  }
}

/**
 * Gets formatted payment status with styling information
 */
export function formatPaymentStatus(status: PaymentStatus): FormattedStatus {
  const statusMap: Record<PaymentStatus, FormattedStatus> = {
    pending: {
      label: 'Pending',
      variant: 'outline',
      className: '',
      icon: React.createElement(Clock, { className: "h-4 w-4" }),
      description: 'Payment not yet processed'
    },
    authorized: {
      label: 'Authorized',
      variant: 'secondary',
      className: '',
      icon: React.createElement(Clock, { className: "h-4 w-4" }),
      description: 'Payment authorized but not captured'
    },
    completed: {
      label: 'Completed',
      variant: 'default',
      className: '',
      icon: React.createElement(Check, { className: "h-4 w-4" }),
      description: 'Payment processed successfully'
    },
    failed: {
      label: 'Failed',
      variant: 'destructive',
      className: '',
      icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
      description: 'Payment processing failed'
    },
    refunded: {
      label: 'Refunded',
      variant: 'outline',
      className: 'bg-purple-100 text-purple-800',
      icon: React.createElement(Check, { className: "h-4 w-4" }),
      description: 'Payment was refunded'
    }
  }

  return statusMap[status] || {
    label: status,
    variant: 'outline',
    className: ''
  }
}

/**
 * Gets available actions based on booking and payment status
 */
export function getAvailableActions(bookingStatus: BookingStatus | string, paymentStatus: PaymentStatus | string) {
  const actions = {
    canApprove: false,
    canReject: false,
    canMarkCompleted: false,
    canMarkFailed: false,
    canMarkPending: false,
    canCancel: false,
    canCapturePayment: false
  }

  // For robustness, convert status to lowercase and check for partial matches
  const status = bookingStatus?.toString().toLowerCase() || '';
  const payment = paymentStatus?.toString().toLowerCase() || '';
  
  // Approval actions - check for substring to be robust against format variations
  if (status.includes('awaiting') && status.includes('approval')) {
    actions.canApprove = true;
    actions.canReject = true;
  }

  // Payment actions for confirmed bookings
  if (status === 'confirmed') {
    // Can't mark as the current status
    actions.canMarkCompleted = payment !== 'completed';
    actions.canMarkFailed = payment !== 'failed';
    actions.canMarkPending = payment !== 'pending';

    // Special case for authorized payments that need capturing
    actions.canCapturePayment = payment === 'authorized';
  }

  // Cancelation is possible for pending/confirmed bookings
  if (['pending', 'confirmed', 'awaiting-approval', 'awaiting_approval'].includes(status) || 
      (status.includes('awaiting') && status.includes('approval'))) {
    actions.canCancel = true;
  }

  return actions;
}

/**
 * Formats a machine-readable status key for display
 * E.g., "awaiting_approval" -> "Awaiting Approval"
 */
export function formatStatusKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}