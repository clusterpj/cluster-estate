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

  const processFormData = async (data: PropertyFormValues, isUpdate = false) => {
    console.log('Processing form data...')
    try {
      console.log('Getting current user...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Convert dates to ISO strings
      const availableFrom = data.available_from ? new Date(data.available_from).toISOString() : null
      const availableTo = data.available_to ? new Date(data.available_to).toISOString() : null

      // Process images array
      const processedImages = Array.isArray(data.images) ? 
        data.images.filter(img => typeof img === 'string') : 
        []

      console.log('Creating processed data...')
      // For updates, only include changed fields
      const processedData = isUpdate ? {
        id: data.id,
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.sale_price && { sale_price: data.sale_price }),
        ...(data.rental_price && { rental_price: data.rental_price }),
        ...(data.pets_allowed && { pets_allowed: data.pets_allowed }),
        ...(data.pet_restrictions && { pet_restrictions: data.pet_restrictions }),
        ...(data.pet_deposit && { pet_deposit: data.pet_deposit }),
        ...(data.location && { location: data.location }),
        ...(data.bedrooms && { bedrooms: data.bedrooms }),
        ...(data.bathrooms && { bathrooms: data.bathrooms }),
        ...(data.square_feet && { square_feet: data.square_feet }),
        ...(data.status && { status: data.status }),
        ...(data.listing_type && { listing_type: data.listing_type }),
        ...(data.property_type && { property_type: data.property_type }),
        ...(data.rental_frequency && { rental_frequency: data.rental_frequency }),
        ...(data.minimum_rental_period && { minimum_rental_period: data.minimum_rental_period }),
        ...(data.deposit_amount && { deposit_amount: data.deposit_amount }),
        ...(data.available_from && { available_from: availableFrom }),
        ...(data.available_to && { available_to: availableTo }),
        ...(data.features && { features: data.features }),
        ...(data.images && { images: processedImages }),
        updated_at: new Date().toISOString()
      } : {
        ...data,
        sale_price: data.sale_price || null,
        rental_price: data.rental_price || null,
        features: Array.isArray(data.features) ? data.features : [],
        images: processedImages,
        user_id: user?.id,
        property_type: data.property_type || 'house',
        available_from: availableFrom,
        available_to: availableTo,
        updated_at: new Date().toISOString()
      }

      return processedData
    } catch (error) {
      console.error('Error processing property data:', error)
      throw error
    }
  }

  return {
    form,
    processFormData
  }
}
