"use client"

import React from "react"
import { PropertyCard } from "./PropertyCard"
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"
import { getSupabaseClient } from "@/lib/supabase"
import { Database } from '@/types/supabase';
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

import type { Database } from '@/types/supabase';

export function PropertyList() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "created_at.desc"

  const query = React.useMemo(() => {
    const queryBuilder = getSupabaseClient()
      .from("properties")
      .select("*")
      .ilike("title", `%${search}%`)

    // Handle multiple sort fields
    const sortFields = sort.split(",")
    sortFields.forEach((field) => {
      const [fieldName, direction] = field.split(".")
      queryBuilder.order(fieldName, { ascending: direction === "asc", nullsFirst: true })
    })

    return queryBuilder
  }, [search, sort])

  const { data: properties, isLoading } = useQuery(query, {
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No properties found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
