'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'
import { PropertyFormValues } from '../schema'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface FeaturesSectionProps {
  form: UseFormReturn<PropertyFormValues>
}

export function FeaturesSection({ form }: FeaturesSectionProps) {
  const t = useTranslations('auth.adminSection.properties')

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">{t('form.features')}</h3>
      </div>
      
      <FormField
        control={form.control}
        name="features"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.features')}</FormLabel>
            <FormDescription>{t('form.featuresDescription')}</FormDescription>
            <FormControl>
              <div className="space-y-2">
                <Input
                  placeholder={t('form.featuresPlaceholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault()
                      const newFeature = e.currentTarget.value.trim()
                      const currentFeatures = form.getValues('features')
                      
                      if (newFeature && !currentFeatures.includes(newFeature)) {
                        form.setValue('features', [...currentFeatures, newFeature])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {field.value.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                      <button
                        type="button"
                        onClick={() => {
                          const currentFeatures = form.getValues('features')
                          form.setValue('features', currentFeatures.filter(f => f !== feature))
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
