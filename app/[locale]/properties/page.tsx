import { Container } from "@/components/ui/container"
import { PropertyList } from "@/components/properties/PropertyList"
import { PropertySearch } from "@/components/properties/PropertySearch"
import { PropertySort } from "@/components/properties/PropertySort"
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider"

export default async function PropertiesPage({
  searchParams
}: {
  searchParams: { type?: 'villa' | 'condo' }
}) {
  const title = searchParams.type 
    ? `${searchParams.type.charAt(0).toUpperCase()}${searchParams.type.slice(1)} Properties`
    : 'All Properties';

  return (
    <Container>
      <QueryClientProviderWrapper>
      <div className="space-y-8 pt-24 md:pt-32">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground">
            Discover our exclusive collection of luxury properties
          </p>
        </div>

        {/* Search and Sort Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 md:max-w-sm">
            <PropertySearch />
          </div>
          <div className="flex items-center gap-4">
            <PropertySort />
          </div>
        </div>

        {/* Property List */}
        <div>
          <PropertyList searchParams={searchParams} />
        </div>
      </div>
      </QueryClientProviderWrapper>
    </Container>
  )
}
