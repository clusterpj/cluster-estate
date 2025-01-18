"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bath, Bed, MapPin, Maximize } from "lucide-react"
import { FadeInView } from "@/components/animations/fade-in-view"
import { useTranslations } from 'next-intl'
import { Property } from "@/types/property"
import { PriceDisplay } from "@/components/properties/PriceDisplay"
import { PropertyBooking } from "@/components/properties/PropertyBooking/PropertyBooking"
import { isPropertyAvailableForBooking } from "@/types/property"
import { PropertyGallery } from "./PropertyGallery"

export function PropertyDetails({ property }: { property: Property }) {
  const t = useTranslations('PropertyDetails')
  const propertyWithAvailability = isPropertyAvailableForBooking(property)

  return (
    <div className="py-8">
      <FadeInView>
        <Card className="overflow-hidden">
          <div className="relative">
            <PropertyGallery property={property} />
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Badge className="bg-caribbean-600 hover:bg-caribbean-700">
                {t(`FeaturedProperties.propertyType.${property.property_type}`)}
              </Badge>
              <Badge className="bg-caribbean-600 hover:bg-caribbean-700">
                {property.listing_type}
              </Badge>
              {property.status !== 'available' && (
                <Badge variant="secondary">
                  {property.status}
                </Badge>
              )}
            </div>
          </div>
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

            {(property.listing_type === 'rent' || property.listing_type === 'both') && (
              <div className="mt-8">
                {propertyWithAvailability.isAvailable ? (
                  <PropertyBooking property={property} />
                ) : (
                  <div className="text-muted-foreground">
                    {propertyWithAvailability.availabilityMessage}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInView>
    </div>
  )
}
