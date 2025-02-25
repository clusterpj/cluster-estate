"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Bath, Bed, Heart, MapPin, Maximize, PawPrint, Wifi, Car, Tv, Coffee, Snowflake, Lock, Fan, Trees, UtensilsCrossed, Waves, Share2, Calendar, Shield } from "lucide-react"
import { FadeInView } from "@/components/animations/fade-in-view"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { PriceDisplay } from "@/components/properties/PriceDisplay"
import { PropertyBooking } from "@/components/properties/PropertyBooking/PropertyBooking"
import { isPropertyAvailableForBooking, Property } from "@/types/property"
import { PropertyGallery } from "./PropertyGallery"
import { PropertyBadge } from "./PropertyBadge"
import { SectionHeading } from "./SectionHeading"
import { toast } from "@/components/ui/use-toast"
import { PublicAvailabilityCalendar } from "../PublicAvailabilityCalendar"
import { PropertyAmenityItem } from "./PropertyAmenityItem"

export function PropertyDetails({ property }: { property: Property }) {
  const t = useTranslations('PropertyDetails')
  const [isFavorite, setIsFavorite] = useState(false)
  const propertyWithAvailability = isPropertyAvailableForBooking(property)
  const [isViewAvailabilityDialogOpen, setIsViewAvailabilityDialogOpen] = useState(false)
  const router = useRouter()

  // Feature mapping with icons and translation keys
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

  const handleShareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description?.substring(0, 100) + '...',
        url: window.location.href,
      })
        .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('share.copied'),
        description: t('share.linkCopied'),
      });
    }
  };
  
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? t('favorites.removed') : t('favorites.added'),
      description: isFavorite 
        ? t('favorites.removedDescription') 
        : t('favorites.addedDescription'),
    });
  };

  const handleViewAvailability = () => {
    setIsViewAvailabilityDialogOpen(true);
  };

  const handleContactHost = () => {
    router.push(`/contact?propertyId=${property.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
      <FadeInView>
        {/* Property Gallery with Badges */}
        <div className="relative mb-8">
          <PropertyGallery property={property} />
          
          {/* Action buttons with improved styling */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button 
              onClick={handleToggleFavorite}
              variant="secondary" 
              size="icon" 
              className="rounded-full bg-white/90 hover:bg-white shadow-md"
              aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
            
            <Button
              onClick={handleShareProperty}
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white shadow-md"
              aria-label={t('share.property')}
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-8">
          {/* Main Content Area */}
          <div className="space-y-10">
            {/* Property Header */}
            <div className="space-y-4">
              {/* Property Status Badges */}
              <div className="flex flex-wrap gap-2">
                <PropertyBadge 
                  color="accent" 
                  label={t(`FeaturedProperties.propertyType.${property.property_type}`)} 
                />
                <PropertyBadge 
                  color="accent" 
                  label={property.listing_type} 
                />
                {property.status !== 'available' && (
                  <PropertyBadge 
                    color="muted" 
                    label={property.status} 
                  />
                )}
              </div>
              
              {/* Title and Location */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{property.location}</span>
                </div>
              </div>
              
              {/* Property Stats */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <Bed className="h-7 w-7 text-primary mb-2" />
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{property.bedrooms}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.beds')}</div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <Bath className="h-7 w-7 text-primary mb-2" />
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{property.bathrooms}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.baths')}</div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <Maximize className="h-7 w-7 text-primary mb-2" />
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{property.square_feet}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('overview.sqft')}</div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <PawPrint className="h-7 w-7 text-primary mb-2" />
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {property.pets_allowed ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('pets.petsAllowed')}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            <div>
              <SectionHeading title={t('sections.description')} />
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>
            
            {/* Pet Information Section - Only shown if pets are allowed */}
            {property.pets_allowed && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <SectionHeading 
                  title={t('pets.information')} 
                  className="mb-4"
                />
                
                <div className="space-y-6">
                  {property.pet_restrictions && property.pet_restrictions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                        {t('pets.restrictions')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {property.pet_restrictions?.map((restriction, index) => (
                          <Badge key={index} variant="outline" className="bg-white dark:bg-gray-700">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {property.pet_deposit && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                        {t('pets.deposit')}
                      </h4>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 inline-block">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ${property.pet_deposit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Features/Amenities Section */}
            {property.features && property.features.length > 0 && (
              <div>
                <SectionHeading 
                  title={t('sections.features')} 
                  subtitle={t('sections.featuresSubtitle')}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => {
                    const featureKey = Object.keys(featureMapping).find(key =>
                      feature.toLowerCase().includes(key)
                    ) || 'default';

                    const { icon: IconComponent = Maximize } = featureMapping[featureKey] || {};
                    const translatedFeature = featureMapping[featureKey]?.translationKey
                      ? t(featureMapping[featureKey].translationKey)
                      : feature;

                    return (
                      <PropertyAmenityItem 
                        key={index} 
                        icon={<IconComponent className="h-5 w-5" />} 
                        label={translatedFeature} 
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Trust & Safety Section */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {t('sections.trustSafety')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('sections.trustSafetyDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card - right side */}
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
                        {t('booking.noChargeYet')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm text-center py-2">
                      {propertyWithAvailability.availabilityMessage}
                    </div>
                  )}
                </div>
              )}
              
              {/* Contact and Calendar Buttons */}
              <div className="p-4 pt-0 flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg" 
                  onClick={handleViewAvailability}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('booking.viewAvailability')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg" 
                  onClick={handleContactHost}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('booking.contactHost')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeInView>

      {/* View Availability Dialog */}
      <Dialog open={isViewAvailabilityDialogOpen} onOpenChange={setIsViewAvailabilityDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('booking.viewAvailability')}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <PublicAvailabilityCalendar propertyId={property.id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}