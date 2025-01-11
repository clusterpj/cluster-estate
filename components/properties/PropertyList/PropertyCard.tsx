import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EyeIcon, HeartIcon, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]

import { useParams } from 'next/navigation'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const params = useParams()
  const mainImage = property.images?.[0] || "/placeholder.jpg"
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-lg font-semibold">{property.title}</h3>
          <Badge variant="secondary">
            {t(`propertyType.${property.property_type}`)}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{property.location}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span>{property.bedrooms} beds</span>
          <span>•</span>
          <span>{property.bathrooms} baths</span>
          <span>•</span>
          <span>{property.square_feet} sqft</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {property.sale_price && (
                <div className="text-lg font-bold">
                  ${property.sale_price.toLocaleString()}
                </div>
              )}
              {property.rental_price && (
                <div className="text-sm text-muted-foreground">
                  ${property.rental_price.toLocaleString()}
                  {property.rental_frequency && (
                    <span>/{property.rental_frequency}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <HeartIcon className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href={`/${params.locale}/properties/${property.id}`}>
                  <EyeIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/${params.locale}/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
