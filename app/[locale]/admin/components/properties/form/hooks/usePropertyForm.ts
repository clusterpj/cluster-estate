import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertyFormSchema, PropertyFormValues } from '../schema'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export function usePropertyForm(initialData?: PropertyFormValues) {
  const supabase = createClientComponentClient<Database>()
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      sale_price: 0,
      pets_allowed: false,
      pet_restrictions: [],
      pet_deposit: undefined,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      square_feet: 0,
      status: 'available',
      listing_type: 'sale',
      property_type: 'house',
      rental_price: undefined,
      rental_frequency: undefined,
      minimum_rental_period: undefined,
      deposit_amount: undefined,
      available_from: '',
      available_to: '',
      features: [],
      images: [],
      ...(initialData || {}),
    },
  })

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const processedData = {
        ...data,
        sale_price: data.sale_price || null,
        rental_price: data.rental_price || null,
        features: Array.isArray(data.features) ? data.features : [],
        images: data.images,
        user_id: user?.id,
        property_type: data.property_type || 'house',
        available_from: data.listing_type === 'rent' || data.listing_type === 'both' ? 
          (data.available_from ? new Date(data.available_from).toISOString() : null) : null,
        available_to: data.listing_type === 'rent' || data.listing_type === 'both' ? 
          (data.available_to ? new Date(data.available_to).toISOString() : null) : null,
      }

      return processedData
    } catch (error) {
      console.error('Error processing property data:', error)
      throw error
    }
  }

  return {
    form,
    onSubmit
  }
}
