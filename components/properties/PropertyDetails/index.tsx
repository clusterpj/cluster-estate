"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bath, Bed, MapPin, Maximize } from "lucide-react"
import Image from "next/image"
import { FadeInView } from "../animations/fade-in-view"
import { useTranslations } from 'next-intl'
import { Property } from "@/types/supabase"
import { PriceDisplay } from "../PriceDisplay"

export function PropertyDetails({ property }: { property: Property }) {
  const t = useTranslations('PropertyDetails')

  return (
    <div className="py-8">
      <FadeInView>
        <Card className="overflow-hidden">
          <CardHeader className="relative p-0 aspect-[16/9]">
            <Image
              src={property.images[0] || '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-caribbean-600 hover:bg-caribbean-700">
                {property.listing_type}
              </Badge>
              {property.status !== 'available' && (
                <Badge variant="secondary">
                  {property.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-3xl mb-4 text-caribbean-900 dark:text-caribbean-100">
              {property.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <MapPin className="h-5 w-5" />
              <span>{property.location}</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                <span>{property.bedrooms} {t('beds')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5" />
                <span>{property.bathrooms} {t('baths')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5" />
                <span>{property.square_feet} {t('sqft')}</span>
              </div>
            </div>

            <PriceDisplay property={property} />

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">{t('description')}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeInView>
    </div>
  )
}
