import type { PayPalButtonsComponentProps } from '@paypal/react-paypal-js'

export interface PayPalOrderData {
  intent: 'CAPTURE' | 'AUTHORIZE'
  purchase_units: {
    amount: {
      value: string
      currency_code: string
      breakdown?: {
        item_total: {
          value: string
          currency_code: string
        }
      }
    }
    items?: {
      name: string
      quantity: string
      unit_amount: {
        value: string
        currency_code: string
      }
    }[]
  }[]
}

export interface PayPalCaptureResponse {
  create_time?: string
  update_time?: string
  id?: string
  status?: string
  payer?: {
    email_address?: string
    name?: {
      given_name?: string
      surname?: string
    }
    address?: {
      country_code?: string
    }
  }
  payment_source?: {
    card?: {
      name?: string
      last_digits?: string
      bin_details?: Record<string, unknown>
    }
    paypal?: Record<string, unknown>
    venmo?: Record<string, unknown>
  }
}

export interface PayPalError {
  message?: string
  details?: Record<string, unknown>
}

export interface PayPalButtonsProps extends PayPalButtonsComponentProps {
  totalPrice: number
  currency?: string
  onApprove: (
    data: { orderID: string; payerID?: string | null | undefined },
    actions: {
      order: {
        capture: () => Promise<PayPalCaptureResponse>
      }
    } | undefined
  ) => Promise<void>
  onError: (error: { message?: string; details?: Record<string, unknown> }) => void
  onCancel?: () => void
}
