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
  )
}
