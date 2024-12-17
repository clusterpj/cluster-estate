'use client'

import { useTranslations } from 'next-intl'

export default function Default() {
  const t = useTranslations('common')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('loading')}</h1>
      </div>
    </div>
  )
}
