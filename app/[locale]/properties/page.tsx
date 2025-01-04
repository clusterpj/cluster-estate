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
      </Container>
    </QueryClientProvider>
  )
}
