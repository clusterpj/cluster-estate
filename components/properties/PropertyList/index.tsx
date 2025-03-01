"use client"

import React, { useEffect } from "react"
import { PropertyCard } from "./PropertyCard"
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"
import { getSupabaseClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import { useToast } from "@/components/ui/use-toast"

import type { Database } from '@/types/supabase'

type Property = Database["public"]["Tables"]["properties"]["Row"]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export function PropertyList({ searchParams }: { 
  searchParams: { 
    type?: string, 
    search?: string, 
    sort?: string,
    location?: string,
    startDate?: string,
    endDate?: string
  } 
}) {
  const search = searchParams?.search || ""
  const sort = searchParams?.sort || "created_at.desc"
  const type = searchParams?.type || ""
  const location = searchParams?.location || ""
  const startDate = searchParams?.startDate
  const endDate = searchParams?.endDate
  const t = useTranslations('FeaturedProperties')
  const { toast } = useToast()
  
  // Standard property query without date filtering
  const baseQuery = React.useMemo(() => {
    const queryBuilder = getSupabaseClient()
      .from("properties")
      .select("*")
    
    // Apply text search filter
    if (search) {
      queryBuilder.ilike("title", `%${search}%`)
    }
    
    // Apply location filter
    if (location) {
      queryBuilder.ilike("location", `%${location}%`)
    }
    
    // Apply type filter
    if (type) {
      queryBuilder.eq("property_type", type)
    }

    // Handle multiple sort fields
    const sortFields = sort.split(",")
    sortFields.forEach((field) => {
      const [column, order] = field.split(".")
      queryBuilder.order(column, { ascending: order === "asc" })
    })

    return queryBuilder
  }, [search, sort, type, location])

  // Fetch properties using the base query
  const { 
    data: fetchedProperties, 
    isLoading: isLoadingProperties,
    error: propertiesError
  } = useQuery(baseQuery, {
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // State for date-filtered properties
  const [dateFilteredProperties, setDateFilteredProperties] = React.useState<Property[] | null>(null)
  const [isLoadingDateFilter, setIsLoadingDateFilter] = React.useState(false)

  // Fetch date-filtered properties if date range is provided
  useEffect(() => {
    async function fetchAvailableProperties() {
      if (!startDate || !endDate || !fetchedProperties) return
      
      setIsLoadingDateFilter(true)
      
      try {
        const response = await fetch('/api/properties/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch available properties')
        }
        
        const availableProperties = await response.json()
        
        // If we have properties from the base query, filter them by availability
        if (fetchedProperties && fetchedProperties.length > 0) {
          const availablePropertyIds = new Set(availableProperties.map((p: Property) => p.id))
          const filteredProperties = fetchedProperties.filter(p => availablePropertyIds.has(p.id))
          setDateFilteredProperties(filteredProperties)
        } else {
          setDateFilteredProperties(availableProperties)
        }
      } catch (error) {
        console.error('Error fetching available properties:', error)
        toast({
          title: t('error'),
          description: t('dateFilterError'),
          variant: "destructive",
        })
        setDateFilteredProperties(fetchedProperties)
      } finally {
        setIsLoadingDateFilter(false)
      }
    }
    
    fetchAvailableProperties()
  }, [fetchedProperties, startDate, endDate, toast])

  // Determine which properties to display
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

  // Show loading state
  if (isLoadingProperties || isLoadingDateFilter) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[500px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Show error state
  if (propertiesError) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-destructive">{t('error')}</p>
      </div>
    )
  }

  // Show empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          {startDate && endDate 
            ? t('noPropertiesForDates')
            : t('noProperties')
          }
        </p>
      </div>
    )
  }

  // Show properties
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