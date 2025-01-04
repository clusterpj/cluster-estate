import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EyeIcon, HeartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  price: number
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={property.image_url || "/placeholder.jpg"}
            alt={property.title}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="truncate text-lg font-semibold">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {property.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">
            ${(property.price || 0).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <HeartIcon className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href={`/properties/${property.id}`}>
                <EyeIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
