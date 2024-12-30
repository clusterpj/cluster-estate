'use client'

import { NextIntlClientProvider as Provider } from 'next-intl'
import { useLocale } from 'next-intl'

type Props = {
  children: React.ReactNode
  messages: any
}

export function NextIntlClientProvider({ children, messages }: Props) {
  const locale = useLocale()

  return (
    <Provider locale={locale} messages={messages}>
      {children}
    </Provider>
  )
}
