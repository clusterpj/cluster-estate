import { PropertyImageSlider } from "@/components/ui/PropertyImageSlider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Calendar, Check } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Database } from "@/types/supabase"
import { useParams, useSearchParams } from "next/navigation"
import { useTranslations } from 'next-intl'
import { PropertyMetrics } from "../PropertyMetrics"

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

export function PropertyCard({ property }: PropertyCardProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const t = useTranslations('FeaturedProperties')
  
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const hasDateSearch = !!(startDate && endDate)
  
  return (
    <Link href={`/${params.locale}/properties/${property.id}`} className="block h-full">
      <motion.div
        whileHover={{ 
          y: -5,
          transition: { type: "spring", stiffness: 400 }
        }}
        className="h-full"
      >
        <Card className="group overflow-hidden h-full flex flex-col border-caribbean-100 dark:border-caribbean-800 hover:shadow-lg hover:shadow-caribbean-100/10 dark:hover:shadow-caribbean-700/20 transition-all duration-300">
          <CardHeader className="p-0 relative aspect-[4/3]">
            <PropertyImageSlider
              images={property.images || ["/placeholder.jpg"]}
              title={property.title}
              className="relative z-10"
            />
            {property.status !== 'available' && (
              <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                {property.status}
              </Badge>
            )}
            {property.featured && (
              <Badge className="absolute top-3 right-3 z-10 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
                <Star className="h-3 w-3" />
                {t('featured')}
              </Badge>
            )}
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
          <CardContent className="p-6 flex-grow flex flex-col">
            <PriceDisplay property={property} />
            <CardTitle className="text-xl mb-2 text-caribbean-900 dark:text-caribbean-100 line-clamp-1">
              {property.title}
            </CardTitle>
            <CardDescription className="flex items-center text-muted-foreground mb-2 dark:text-caribbean-300">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </CardDescription>
            <PropertyMetrics property={property} />
            {hasDateSearch && (
              <div className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{t('dateAvailability.available')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}