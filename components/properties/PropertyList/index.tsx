"use client"

import React from "react"
import { PropertyCard } from "./PropertyCard"
import { useQuery } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useAvailabilityFilter } from "@/hooks/useAvailabilityFilter"

// Animation variants for staggered children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

interface PropertyListProps {
  searchParams: { 
    type?: string, 
    search?: string, 
    sort?: string,
    location?: string,
    startDate?: string,
    endDate?: string,
    beds?: string,
    baths?: string,
    minPrice?: string,
    maxPrice?: string,
    petsAllowed?: string
  }
}

export function PropertyList({ searchParams }: PropertyListProps) {
  const search = searchParams?.search || ""
  const sort = searchParams?.sort || "created_at.desc"
  const type = searchParams?.type || ""
  const location = searchParams?.location || ""
  const startDate = searchParams?.startDate || null
  const endDate = searchParams?.endDate || null
  const beds = searchParams?.beds ? parseInt(searchParams.beds) : null
  const baths = searchParams?.baths ? parseInt(searchParams.baths) : null
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : null
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : null
  const petsAllowed = searchParams?.petsAllowed === 'true' ? true : 
                      searchParams?.petsAllowed === 'false' ? false : null
  
  const t = useTranslations('FeaturedProperties')
  
  // Build the supabase query with comprehensive filters
  const baseQuery = React.useMemo(() => {
    const queryBuilder = getSupabaseClient()
      .from("properties")
      .select("*")
    
    // Text search filter for location or title
    if (location) {
      queryBuilder.ilike("location", `%${location}%`)
    }
    
    // Search in title field
    if (search) {
      queryBuilder.ilike("title", `%${search}%`)
    }
    
    // Property type filter
    if (type) {
      queryBuilder.eq("property_type", type)
    }

    // Bedroom filter
    if (beds !== null) {
      queryBuilder.gte("bedrooms", beds)
    }

    // Bathroom filter
    if (baths !== null) {
      queryBuilder.gte("bathrooms", baths)
    }

    // Price range filters - handle both sale and rental prices
    if (minPrice !== null || maxPrice !== null) {
      // For sale properties
      if (minPrice !== null) {
        queryBuilder.or(`sale_price.gte.${minPrice},rental_price.gte.${minPrice}`)
      }
      
      if (maxPrice !== null) {
        queryBuilder.or(`sale_price.lte.${maxPrice},rental_price.lte.${maxPrice}`)
      }
    }

    // Pets allowed filter
    if (petsAllowed !== null) {
      queryBuilder.eq("pets_allowed", petsAllowed)
    }

    // Handle multiple sort fields
    const sortFields = sort.split(",")
    sortFields.forEach((field) => {
      const [column, order] = field.split(".")
      queryBuilder.order(column, { ascending: order === "asc" })
    })

    return queryBuilder
  }, [search, sort, type, location, beds, baths, minPrice, maxPrice, petsAllowed])

  // Fetch properties using the base query
  const { 
    data: fetchedProperties, 
    isLoading: isLoadingProperties,
    error: propertiesError,
    refetch
  } = useQuery({
    queryKey: ['properties', search, sort, type, location, beds, baths, minPrice, maxPrice, petsAllowed],
    queryFn: async () => {
      // Log the constructed query for debugging
      console.log('Executing property query with params:', {
        search, sort, type, location, beds, baths, minPrice, maxPrice, petsAllowed
      });
      
      const result = await baseQuery;
      return result.data;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Use our availability filter hook to handle date-based filtering
  const { 
    dateFilteredProperties, 
    isLoadingDateFilter 
  } = useAvailabilityFilter(fetchedProperties, startDate, endDate);

  // Determine which properties to display with optimized filtering logic
  const properties = React.useMemo(() => {
    // If date filtering is active and we have date-filtered properties
    if ((startDate && endDate) && dateFilteredProperties !== null) {
      if (!dateFilteredProperties.length) return []
      
      // Sort properties to ensure featured properties are always on top
      return [...dateFilteredProperties].sort((a, b) => {
        // Featured properties come first
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        
        // If both are featured or both are not featured, maintain the original sort order
        return 0
      })
    }
    
    // Otherwise use the regular fetched properties
    if (!fetchedProperties) return []
    
    // Create a copy of the properties array to avoid mutating the original data
    return [...fetchedProperties].sort((a, b) => {
      // Featured properties come first
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      
      // If both are featured or both are not featured, maintain the original sort order
      return 0
    })
  }, [fetchedProperties, dateFilteredProperties, startDate, endDate])

  // Show loading state with better visual feedback
  if (isLoadingProperties || isLoadingDateFilter) {
    return (
      <div>
        <div className="flex items-center justify-center mb-6">
          <RefreshCw className="animate-spin h-6 w-6 mr-2 text-primary" />
          <p className="text-muted-foreground">{startDate && endDate ? t('loadingAvailability') : t('loadingProperties')}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[500px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Show error state with retry option
  if (propertiesError) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center gap-4">
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-6 w-6 mr-2" />
          <p>{t('error')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
        >
          {t('retry')}
        </Button>
      </div>
    )
  }

  // Show empty state with better contextual feedback
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center text-center p-8">
        <div className="bg-muted/30 rounded-full p-8 mb-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('noPropertiesTitle')}</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          {startDate && endDate 
            ? t('noPropertiesForDates')
            : type || location || beds || baths || minPrice || maxPrice || petsAllowed !== null
              ? t('noPropertiesWithFilters')
              : t('noProperties')
          }
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            // Clear all filters by redirecting to the base properties page
            window.location.href = '/properties';
          }}
        >
          {t('clearFilters')}
        </Button>
      </div>
    )
  }

  // Show properties with staggered animation
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </motion.div>
  )
}