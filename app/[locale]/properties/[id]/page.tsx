import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { PropertyDetails } from '@/components/properties/PropertyDetails'
import { QueryClientProviderWrapper } from '@/components/providers/query-client-provider'
import { Container } from '@/components/ui/container'

export default async function PropertyPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const supabase = getSupabaseClient()
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) {
    notFound()
  }

  return (
    <Container>
      <QueryClientProviderWrapper>
        <PropertyDetails property={property} />
      </QueryClientProviderWrapper>
    </Container>
  )
}
