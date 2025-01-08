import { type ReactNode } from 'react'
import Script from 'next/script'

export default function PropertyLayout({
  children,
}: {
  children: ReactNode
}) {
  const paypalScript = `https://www.paypal.com/sdk/js?client-id=${
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
  }&currency=USD&intent=capture`

  return (
    <>
      <Script
        id="paypal-js"
        src={paypalScript}
        strategy="lazyOnload"
      />
      {children}
    </>
  )
}