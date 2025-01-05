'use client'

import { NextIntlClientProvider as Provider, AbstractIntlMessages } from 'next-intl'
import { useLocale } from 'next-intl'
import { locales, isValidLocale } from '@/config/i18n'
import { cn } from '@/lib/utils'
import { getTranslationFallback } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  messages: AbstractIntlMessages
  locale: string
}

export function NextIntlClientProvider({ children, messages, locale: propLocale }: Props) {
  const locale = useLocale()
  

  if (!isValidLocale(propLocale)) {
    return (
      <div className={cn(
        "p-4 bg-red-50 text-red-900 border border-red-200 rounded-lg",
        "text-center text-sm"
      )}>
        Invalid locale: {propLocale}
      </div>
    )
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
      getMessageFallback={({ key, namespace }) => getTranslationFallback(key, namespace)}
    >
      {children}
    </Provider>
  )
}
