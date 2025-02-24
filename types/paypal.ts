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

import type { PayPalButtonsComponentProps, OnApproveData, OnApproveActions } from '@paypal/paypal-js';

export interface PayPalButtonsProps extends PayPalButtonsComponentProps {
  totalPrice: number;
  currency?: string;
  onApprove: (
    data: OnApproveData,
    actions: OnApproveActions
  ) => Promise<void>;
  onError: (error: { message?: string; details?: Record<string, unknown> }) => void;
  onCancel?: () => void;
}

export interface PayPalCaptureResponse {
  id?: string;
  status?: string;
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
  create_time?: string;
  update_time?: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalAuthorizationResponse {
  id: string;
  status: string;
  payment_source: {
    paypal?: {
      email_address?: string;
      account_id?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
      address?: {
        country_code?: string;
      };
    };
  };
  purchase_units: Array<{
    reference_id?: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
  }>;
  create_time: string;
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResult {
  success: boolean;
  data?: PayPalCaptureResponse;
  error?: string;
}

export interface PayPalVoidResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}
