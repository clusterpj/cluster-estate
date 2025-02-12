"use client"

import { Badge } from "@/components/ui/badge"
import { Bath, Bed, Heart, MapPin, Maximize, PawPrint, Wifi, Car, Tv, Coffee, Snowflake, Lock, Fan, Trees, UtensilsCrossed, Waves } from "lucide-react"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <FadeInView>
        <div className="relative">
          <PropertyGallery property={property} />
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <Badge className="bg-[#FF5A5F] hover:bg-[#E04A50] text-white">
              {t(`FeaturedProperties.propertyType.${property.property_type}`)}
            </Badge>
            <Badge className="bg-[#FF5A5F] hover:bg-[#E04A50] text-white">
              {property.listing_type}
            </Badge>
            {property.status !== 'available' && (
              <Badge variant="secondary">
                {property.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-8 mt-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="border-t border-b py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">
                    {property.pets_allowed ? t('pets.allowed') : t('pets.notAllowed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{property.bedrooms} {t('overview.beds')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{property.bathrooms} {t('overview.baths')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{property.square_feet} {t('overview.sqft')}</span>
                </div>
              </div>
            </div>

            {property.pets_allowed && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('pets.information')}
                </h3>
                {property.pet_restrictions && property.pet_restrictions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-800">
                      {t('pets.restrictions')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {property.pet_restrictions?.map((restriction, index) => (
                        <Badge key={index} variant="secondary">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {property.pet_deposit && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800">
                      {t('pets.deposit')}
                    </h4>
                    <p className="text-gray-600">
                      ${property.pet_deposit.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('sections.description')}
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </div>

            {property.features && property.features.length > 0 && (
              <div className="border-t pt-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                  {t('sections.features')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  {property.features.map((feature, index) => {
                    type FeatureIcon = typeof Wifi;
                    type FeatureMapping = Record<string, { icon: FeatureIcon, translationKey: string }>;

                    const featureMapping: FeatureMapping = {
                      'wifi': { icon: Wifi, translationKey: 'features.wifi' },
                      'parking': { icon: Car, translationKey: 'features.parking' },
                      'tv': { icon: Tv, translationKey: 'features.tv' },
                      'kitchen': { icon: UtensilsCrossed, translationKey: 'features.kitchen' },
                      'pool': { icon: Waves, translationKey: 'features.pool' },
                      'coffee': { icon: Coffee, translationKey: 'features.coffee' },
                      'ac': { icon: Snowflake, translationKey: 'features.ac' },
                      'security': { icon: Lock, translationKey: 'features.security' },
                      'fan': { icon: Fan, translationKey: 'features.fan' },
                      'garden': { icon: Trees, translationKey: 'features.garden' }
                    };

                    const featureKey = Object.keys(featureMapping).find(key =>
                      feature.toLowerCase().includes(key)
                    ) || 'default';

                    const { icon: IconComponent = Maximize } = featureMapping[featureKey] || {};
                    const translatedFeature = featureMapping[featureKey]?.translationKey
                      ? t(featureMapping[featureKey].translationKey)
                      : feature;

                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-gray-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {translatedFeature}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="border rounded-2xl shadow-lg bg-white dark:bg-gray-800">
              <div className="p-6 border-b">
                <PriceDisplay property={property} />
              </div>
              {(property.listing_type === 'rent' || property.listing_type === 'both') && (
                <div className="p-4">
                  {propertyWithAvailability.isAvailable ? (
                    <div className="space-y-4">
                      <PropertyBooking property={property} />
                      <p className="text-xs text-gray-500 text-center">
                        You won&apos;t be charged yet
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm text-center py-2">
                      {propertyWithAvailability.availabilityMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeInView>
    </div>
  )
}
