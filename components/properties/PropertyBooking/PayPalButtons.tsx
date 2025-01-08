'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useToast } from '@/components/ui/use-toast'

interface PayPalButtonsProps {
  totalPrice: number
  currency?: string
  onApprove: (data: any) => Promise<void>
  onError: (error: any) => void
}

export function PayPalButtonsWrapper({
  totalPrice,
  currency = 'USD',
  onApprove,
  onError
}: PayPalButtonsProps) {
  const { toast } = useToast()
  const [isPayPalReady, setIsPayPalReady] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`
    script.async = true
    script.onload = () => {
      // Add error handling for PayPal SDK
      window.paypal = window.paypal || {}
      window.paypal.Buttons = window.paypal.Buttons || {}
      window.paypal.Buttons.driver = window.paypal.Buttons.driver || {}
      window.paypal.Buttons.driver.logger = {
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
      }
      setIsPayPalReady(true)
    }
    script.onerror = () => {
      console.error('Failed to load PayPal SDK')
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to load payment system'
      })
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [currency])

  return (
    <PayPalScriptProvider 
      options={{
        'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        'disable-funding': 'card,venmo',
        'data-sdk-integration-source': 'integrationbuilder_sc',
        'data-namespace': 'paypal_sdk',
        'data-csp-nonce': 'paypal-nonce',
        'data-client-token': 'paypal-client-token'
      }}
    >
      {isPayPalReady ? (
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: totalPrice.toString(),
                  currency_code: currency
                }
              }]
            })
          }}
          onApprove={async (data, actions) => {
            try {
              await actions.order?.capture()
              await onApprove(data)
            } catch (error) {
              toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: 'There was an error processing your payment'
              })
              onError(error)
            }
          }}
          onError={(error) => {
            toast({
              variant: 'destructive',
              title: 'Payment Error',
              description: error.message || 'Payment failed'
            })
            onError(error)
          }}
          forceReRender={[totalPrice, currency]}
        />
      ) : (
        <div>Loading PayPal...</div>
      )}
    </PayPalScriptProvider>
  )
}
