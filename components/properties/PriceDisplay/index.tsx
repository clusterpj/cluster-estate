"use client"

import { useTranslations } from 'next-intl'
import type { Property } from '@/types/property';

export function PriceDisplay({ property }: { property: Property }) {
  const t = useTranslations('PropertyDetails')
  
  const renderRentalPrice = () => {
    if (!property.rental_price) return null
    const frequency = property.rental_frequency ? t(`rentalFrequency.${property.rental_frequency}`) : ''
    return (
      <div>
        <span className="text-sm text-muted-foreground">{t('forRent')}: </span>
        <span>${property.rental_price.toLocaleString()}</span>
        {frequency && <span className="text-sm text-muted-foreground">/{frequency}</span>}
      </div>
    )
  }

  const renderSalePrice = () => {
    if (property.listing_type === 'rent' || !property.sale_price) return null
    return (
      <div>
        <span className="text-sm text-muted-foreground">{t('forSale')}: </span>
        <span>${property.sale_price.toLocaleString()}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
      {renderSalePrice()}
      {renderRentalPrice()}
    </div>
  )
}
