'use client'

import { NextIntlClientProvider as Provider, AbstractIntlMessages } from 'next-intl'
import { useLocale } from 'next-intl'
import { locales } from '@/config/i18n'

type Props = {
  children: React.ReactNode
  messages: AbstractIntlMessages
  locale: string
}

export function NextIntlClientProvider({ children, messages, locale: propLocale }: Props) {
  const locale = useLocale()
  
  // Validate the locale
  if (!locales.includes(propLocale as any)) {
    return null
  }

  return (
    <Provider 
      locale={locale} 
      messages={messages}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') {
          console.warn(error);
        } else {
          console.error(error);
        }
      }}
      getMessageFallback={({ key, namespace }) => {
        return `[${namespace}.${key}]`;
      }}
    >
      {children}
    </Provider>
  )
}
