"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"
import { getSupabaseClient } from "@/lib/supabase"
import { Database } from "@/types/database"
import { Icon } from "leaflet"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export function PropertyMap() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "created_at.desc"

  const query = React.useMemo(() => 
    getSupabaseClient()
      .from("properties")
      .select("*")
      .ilike("title", `%${search}%`)
      .order(sort.split(".")[0], { ascending: sort.split(".")[1] === "asc" }),
    [search, sort]
  )

  const { data: properties, isLoading } = useQuery(query)

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-lg" />
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">No properties to display on map</p>
      </div>
    )
  }

  // Calculate average coordinates for initial map center
  const validProperties = properties.filter(
    (p) => p.latitude && p.longitude
  )
  const centerLat =
    validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0) /
    validProperties.length
  const centerLng =
    validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0) /
    validProperties.length

  if (typeof window === 'undefined') {
    return <Skeleton className="h-[600px] w-full rounded-lg" />
  }

  const [mapReady, setMapReady] = React.useState(false)

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[centerLat || 0, centerLng || 0]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapReady && validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude || 0, property.longitude || 0]}
            icon={customIcon}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-sm text-muted-foreground">
                  ${property.price.toLocaleString()}
                </p>
                <a
                  href={`/properties/${property.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
