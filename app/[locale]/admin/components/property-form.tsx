'use client'

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

  const handleSubmit = async (data: PropertyFormValues) => {
    try {
      const processedData = await onSubmit(data)
      
      const supabase = createClientComponentClient<Database>()
      let dbOperation
      
      if (mode === 'edit' && propertyId) {
        dbOperation = supabase
          .from('properties')
          .update(processedData)
          .eq('id', propertyId)
          .select()
          .single()
      } else {
        dbOperation = supabase
          .from('properties')
          .insert([processedData])
          .select()
          .single()
      }

      const { error } = await dbOperation

      if (error) throw error
      
      onSuccess?.()
    } catch (error) {
      console.error('Error in form submission:', error)
      onError?.(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full h-[calc(100vh-200px)] overflow-y-auto">
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
          <Button type="submit">{t('form.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}
