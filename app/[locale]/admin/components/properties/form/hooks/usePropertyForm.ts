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
      pet_deposit: 0,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      square_feet: 0,
      status: 'available',
      listing_type: 'sale',
      property_type: 'house',
      rental_price: 0,
      rental_frequency: 'monthly',
      minimum_rental_period: 0,
      deposit_amount: 0,
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
      // Create base data object
      const processedData: any = {
        title: data.title || '',
        description: data.description || '',
        sale_price: data.sale_price || 0,
        pets_allowed: data.pets_allowed || false,
        pet_restrictions: Array.isArray(data.pet_restrictions) ? data.pet_restrictions : [],
        pet_deposit: data.pet_deposit || 0,
        location: data.location || '',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        square_feet: data.square_feet || 0,
        status: data.status || 'available',
        listing_type: data.listing_type || 'sale',
        property_type: data.property_type || 'house',
        rental_price: data.rental_price || 0,
        rental_frequency: data.rental_frequency || 'monthly',
        minimum_rental_period: data.minimum_rental_period || 0,
        deposit_amount: data.deposit_amount || 0,
        available_from: availableFrom,
        available_to: availableTo,
        features: Array.isArray(data.features) ? data.features : [],
        images: processedImages,
        // Removed updated_at since it doesn't exist in the schema
      }

      // Only add user_id for new properties
      if (!isUpdate) {
        processedData.user_id = user.id
      }

      console.log('Processed data:', processedData)
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
