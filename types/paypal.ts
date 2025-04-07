// Cabarete Villas PayPal Type Definitions

export interface PayPalAuthorization {
  purchase_units: Array<{
    payments?: {
      authorizations?: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
  status: string;
}

export interface GuestPayPalButtonsProps {
  totalPrice: number;
  currency?: string;
  onApprove: (data: { 
    orderID: string; 
    payerID?: string 
  }, actions: { 
    order?: { 
      authorize: () => Promise<PayPalAuthorization>;
      capture: () => Promise<unknown>;
    } 
  }) => Promise<void>;
  onError: (error: { message?: string }) => void;
  onCancel?: () => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    label?: 'paypal' | 'checkout' | 'pay' | 'installment';
  };
  forceReRender?: Array<unknown>;
  disabled?: boolean;
  guestInfo?: {
    email: string;
    name: string;
    phone?: string;
  };
  isGuestCheckout?: boolean;
}
