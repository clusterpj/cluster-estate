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

interface PetInformationProps {
  form: UseFormReturn<PropertyFormValues>
}

export function PetInformation({ form }: PetInformationProps) {
  const t = useTranslations('auth.adminSection.properties')

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">{t('form.petInformation')}</h3>
      </div>
      
      <FormField
        control={form.control}
        name="pet_restrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.petRestrictions')}</FormLabel>
            <FormDescription>{t('form.petRestrictionsDescription')}</FormDescription>
            <FormControl>
              <div className="space-y-2">
                <Input
                  placeholder={t('form.petRestrictionsPlaceholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault()
                      const newRestriction = e.currentTarget.value.trim()
                      const currentRestrictions = form.getValues('pet_restrictions')
                      
                      if (newRestriction && !currentRestrictions.includes(newRestriction)) {
                        form.setValue('pet_restrictions', [...currentRestrictions, newRestriction])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {field.value.map((restriction, index) => (
                    <Badge key={index} variant="secondary">
                      {restriction}
                      <button
                        type="button"
                        onClick={() => {
                          const currentRestrictions = form.getValues('pet_restrictions')
                          form.setValue('pet_restrictions', currentRestrictions.filter(r => r !== restriction))
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

      <FormField
        control={form.control}
        name="pet_deposit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.petDeposit')}</FormLabel>
            <FormControl>
              <Input
                id="pet_deposit"
                type="number"
                value={isNaN(field.value) ? '' : field.value}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  field.onChange(isNaN(value) ? 0 : value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
