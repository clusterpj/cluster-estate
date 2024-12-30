'use client'

import { useTranslations } from 'next-intl'

export function DashboardHeader() {
  const t = useTranslations('auth.adminSection')

  return (
    <div className="flex flex-col gap-2 mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">
        {t('description')}
      </p>
    </div>
  )
}
