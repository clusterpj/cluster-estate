'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { UpdateButton } from './properties/form/UpdateButton'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { PropertyFormValues } from './properties/form/schema'
import { BasicInformation } from '@/app/[locale]/admin/components/properties/form/sections/BasicInformation'
import { SaleInformation } from '@/app/[locale]/admin/components/properties/form/sections/SaleInformation'
import { RentalInformation } from '@/app/[locale]/admin/components/properties/form/sections/RentalInformation'
import { PetInformation } from '@/app/[locale]/admin/components/properties/form/sections/PetInformation'
import { FeaturesSection } from '@/app/[locale]/admin/components/properties/form/sections/FeaturesSection'
import { ImagesSection } from '@/app/[locale]/admin/components/properties/form/sections/ImagesSection'
import { usePropertyForm } from '@/app/[locale]/admin/components/properties/form/hooks/usePropertyForm'
import { PropertyFormProps } from '@/app/[locale]/admin/components/properties/form/types'

export function PropertyForm({ 
  onSuccess, 
  onError, 
  initialData, 
  mode = 'create',
  propertyId 
}: PropertyFormProps) {
  const t = useTranslations('auth.adminSection.properties')
  const { form, processFormData } = usePropertyForm(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (data: PropertyFormValues) => {
    console.log('Creating new property...')
    setIsLoading(true)
    
    try {
      const isValid = await form.trigger()
      if (!isValid) {
        console.log('Form validation failed')
        return
      }

      const processedData = await processFormData(data, false)
      console.log('Processed data:', processedData)
      
      const supabase = createClientComponentClient<Database>()
      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert([processedData])
        .select()
        .single()

      if (insertError) throw insertError
      
      console.log('Property created successfully:', newProperty)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating property:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: PropertyFormValues) => {
    console.log('Starting update process...')
    setIsLoading(true)
    
    try {
      console.log('Validating form...')
      const isValid = await form.trigger()
      if (!isValid) {
        console.error('Form validation failed')
        throw new Error('Form validation failed')
      }

      console.log('Processing form data...')
      const processedData = await processFormData(data, true)
      console.log('Processed data for update:', processedData)
      
      console.log('Initializing Supabase client...')
      const supabase = createClientComponentClient<Database>()
      
      console.log('Sending update request to Supabase...')
      const { data: updateResult, error: updateError } = await supabase
        .from('properties')
        .update(processedData)
        .eq('id', propertyId!)
        .select()
        .single()

      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw updateError
      }
      
      if (!updateResult) {
        console.error('No data returned from update')
        throw new Error('No data returned from update')
      }
      
      console.log('Property updated successfully:', updateResult)
      onSuccess?.()
      return updateResult
    } catch (error) {
      console.error('Error updating property:', error)
      onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (data: PropertyFormValues) => {
    console.log('Form submit handler triggered')
    console.log('Form data:', data)
    console.log('Mode:', mode)
    console.log('Property ID:', propertyId)
    
    try {
      if (mode === 'edit' && propertyId) {
        console.log('Attempting to update property...')
        await handleUpdate(data)
      } else {
        console.log('Attempting to create new property...')
        await handleCreate(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
      onError?.(error)
      throw error
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8 w-full h-[calc(100vh-200px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:gap-x-12 gap-y-8 px-4">
          {/* Left Column */}
          <div className="space-y-6">
            <BasicInformation form={form} />
          </div>

          {/* Right Column */}
          <div className="space-y-6 pb-8">
            {(form.watch('listing_type') === 'sale' || form.watch('listing_type') === 'both') && (
              <SaleInformation form={form} />
            )}

            {(form.watch('listing_type') === 'rent' || form.watch('listing_type') === 'both') && (
              <RentalInformation form={form} />
            )}

            {form.watch('pets_allowed') && (
              <PetInformation form={form} />
            )}

            <FeaturesSection form={form} />
            <ImagesSection form={form} onError={onError} />
          </div>
        </div>

        <div className="flex justify-end">
          {mode === 'edit' ? (
            <UpdateButton isLoading={isLoading} />
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('form.saving')}
                </div>
              ) : (
                t('form.submit')
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
