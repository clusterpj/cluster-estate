import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Calendar, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Database } from "@/types/supabase"
import { useParams, useSearchParams } from "next/navigation"
import { useTranslations } from 'next-intl'
import { PropertyMetrics } from "../PropertyMetrics" // Import the shared component with the new name

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface PropertyCardProps {
  property: Property
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(price);
}

function PriceDisplay({ property }: { property: Property }) {
  const t = useTranslations('FeaturedProperties');

  const renderPrice = () => {
    // For sale properties
    if (property.listing_type === 'sale' || property.listing_type === 'both') {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-caribbean-600">
            {t('price.forSale')}
          </Badge>
          <span className="text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
            ${formatPrice(property.sale_price || 0)}
          </span>
        </div>
      );
    }

    // For rental properties
    if (property.listing_type === 'rent' || property.listing_type === 'both') {
      const frequency = property.rental_frequency ?  
        t(`price.rentalFrequency.${property.rental_frequency}`) : '';
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600">
            {t('price.forRent')}
          </Badge>
          <span className="text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
            ${formatPrice(property.rental_price || 0)}
          </span>
          {frequency && 
            <span className="text-sm text-muted-foreground">/{frequency}</span>
          }
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mb-4">
      {renderPrice()}
    </div>
  );
}

function PropertyImage({ images, title }: { images: string[], title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Simple automatic image rotation on hover without UI controls
  const handleMouseEnter = useCallback(() => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
    }
  }, [currentImageIndex, images.length]);

  return (
    <div 
      className="relative w-full h-full aspect-[4/3] overflow-hidden"
      onMouseEnter={handleMouseEnter}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={currentImageIndex === 0}
            onLoad={() => setIsImageLoaded(true)}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Simple image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const t = useTranslations('FeaturedProperties')
  
  // Check if date range is selected in search params
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const hasDateSearch = !!(startDate && endDate)
  
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        transition: { type: "spring", stiffness: 400 }
      }}
      className="h-full"
    >
      <Card className="group overflow-hidden h-full flex flex-col border-caribbean-100 dark:border-caribbean-800 hover:shadow-lg hover:shadow-caribbean-100/10 dark:hover:shadow-caribbean-700/20 transition-all duration-300">
        <Link href={`/${params.locale}/properties/${property.id}`} className="block flex-none">
          <CardHeader className="p-0 relative aspect-[4/3]">
            <PropertyImage 
              images={property.images || ["/placeholder.jpg"]} 
              title={property.title} 
            />
            {/* Status badge if needed */}
            {property.status !== 'available' && (
              <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                {property.status}
              </Badge>
            )}
            
            {/* Featured badge */}
            {property.featured && (
              <Badge className="absolute top-3 right-3 z-10 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
                <Star className="h-3 w-3" />
                {t('featured')}
              </Badge>
            )}
            
            {/* Date availability badge - only show when date search is active */}
            {hasDateSearch && (
              <Badge 
                className="absolute bottom-3 left-3 z-10 bg-green-500 text-white flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                <Check className="h-3 w-3" />
                {t('dateAvailability.available')}
              </Badge>
            )}
          </CardHeader>
        </Link>
        
        <CardContent className="p-6 flex-grow flex flex-col">
          {/* Price displayed at the top */}
          <PriceDisplay property={property} />
          
          <CardTitle className="text-xl mb-2 text-caribbean-900 dark:text-caribbean-100 line-clamp-1">
            {property.title}
          </CardTitle>
          
          <CardDescription className="flex items-center text-muted-foreground mb-2 dark:text-caribbean-300">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </CardDescription>
          
          {/* Use the shared PropertyMetrics component */}
          <PropertyMetrics property={property} />
          
          {/* Date availability info - only show when date search is active */}
          {hasDateSearch && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{t('dateAvailability.available')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}