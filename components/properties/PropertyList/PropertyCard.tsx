import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, ArrowUpRight, Heart, MapPin, Maximize } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Database } from "@/types/supabase"
import { useQuery } from '@tanstack/react-query'
import { useParams } from "next/navigation"
import { useTranslations } from 'next-intl'

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const params = useParams()
  const t = useTranslations('FeaturedProperties')
  const mainImage = property.images?.[0] || "/placeholder.jpg"
  const [isHovered, setIsHovered] = useState(false)

  const { data: favoriteStatus } = useQuery({
    queryKey: ['property-favorite', property.id],
    queryFn: async () => false,
    staleTime: 1000 * 60 * 5
  })

  useEffect(() => {
    if (favoriteStatus !== undefined) {
      setIsFavorite(favoriteStatus)
    }
  }, [favoriteStatus])

  return (
    <Card className="group relative overflow-hidden bg-background transition-all hover:shadow-lg">
      <Link 
        href={`/${params.locale}/properties/${property.id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden"
         onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-full w-full">
         <div className="absolute left-4 top-4 z-10 flex gap-2">
          <Badge className="bg-background/90 hover:bg-background/95">
            {property.listing_type ? t(`listingType.${property.listing_type}`) : t('listingType.unknown')}
            </Badge>
          {property.features?.includes('featured') && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              Featured
            </Badge>
          )}
        </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 bg-background/90 hover:bg-background/95"
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
             }}
         >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
          </Button>

          <AnimatePresence>
            <motion.div
              key={mainImage}
              className="absolute h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={mainImage}
                alt={property.title}
                fill
      
          className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>

            {property.images?.[1] && (
              <motion.div
                key="secondary-image"
                className="absolute h-full w-full"
                initial={{ y: '100%' }}
                animate={{ y: isHovered ? '0%' : '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
              >
                <Image
                  src={property.images[1]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      <CardContent className="p-6">
        {/* Location */}
        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Title */}
        <Link 
          href={`/${params.locale}/properties/${property.id}`}
          className="group/link mb-4 block"
        >
          <h3 className="truncate text-xl font-semibold tracking-tight transition-colors group-hover/link:text-primary">
            {property.title}
          </h3>
        </Link>

        {/* Features */}
        <div className="mb-6 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{property.square_feet.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {property.listing_type === 'sale' && property.sale_price && (
              <div className="text-2xl font-bold">
                ${property.sale_price.toLocaleString()}
              </div>
            )}
            {property.listing_type === 'rent' && property.rental_price && (
              <div className="text-sm text-muted-foreground">
                ${property.rental_price.toLocaleString()}
                {property.rental_frequency ? (
                  <span>/{property.rental_frequency}</span>
                ) : null}
              </div>
            )}
          </div>
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link href={`/${params.locale}/properties/${property.id}`}>
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
