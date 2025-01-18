'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
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
  const { form, onSubmit } = usePropertyForm(initialData)
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

      const processedData = await onSubmit(data)
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
    console.log('Updating property...')
    setIsLoading(true)
    
    try {
      const isValid = await form.trigger()
      if (!isValid) {
        console.log('Form validation failed')
        return
      }

      const processedData = await onSubmit(data)
      console.log('Processed data:', processedData)
      
      const supabase = createClientComponentClient<Database>()
      const { error: updateError } = await supabase
        .from('properties')
        .update(processedData)
        .eq('id', propertyId!)

      if (updateError) throw updateError
      
      console.log('Property updated successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating property:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: PropertyFormValues) => {
    if (mode === 'edit' && propertyId) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('Form submit event triggered')
          e.preventDefault()
          form.handleSubmit(handleSubmit)(e)
        }} 
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
