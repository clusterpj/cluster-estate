<<<<<<< HEAD
import { Container } from "@/components/ui/container"
import { Separator } from "@/components/ui/separator"
import { PropertyFilters } from "@/components/properties/PropertyFilters"
import { PropertyList } from "@/components/properties/PropertyList"
import { PropertySearch } from "@/components/properties/PropertySearch"
import { PropertySort } from "@/components/properties/PropertySort"
import { PropertyMap } from "@/components/properties/PropertyMap"
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider"

export default async function PropertiesPage() {
  return (
    <Container>
      <QueryClientProviderWrapper>
      <div className="space-y-6 pb-16 pt-6 md:pb-24 md:pt-10">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Luxury Properties
          </h1>
          <p className="text-muted-foreground">
            Discover our exclusive collection of luxury properties
          </p>
        </div>

        <Separator className="my-6" />

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <PropertySearch />
          </div>
          <div className="flex gap-2">
            <PropertyFilters />
            <PropertySort />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Property Grid */}
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="hidden md:block">
            <PropertyMap />
          </div>
          <div>
            <PropertyList />
          </div>
        </div>
      </div>
      </QueryClientProviderWrapper>
    </Container>
=======
import { Suspense } from 'react'
import { PropertyList } from '@/components/properties/PropertyList'
import { PropertyFilters } from '@/components/properties/PropertyFilters'
import { PropertySearch } from '@/components/properties/PropertySearch'
import { PropertyListSkeleton } from '@/components/properties/PropertyListSkeleton'

export default async function PropertiesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Properties</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <PropertyFilters />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <PropertySearch />
          </div>
          
          <Suspense fallback={<PropertyListSkeleton />}>
            <PropertyList />
          </Suspense>
        </div>
      </div>
    </main>
>>>>>>> 5101641556a237932f6a40d751f4500109460cbf
  )
}
