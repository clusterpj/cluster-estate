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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface SaleInformationProps {
  form: UseFormReturn<PropertyFormValues>
}

export function SaleInformation({ form }: SaleInformationProps) {
  const t = useTranslations('auth.adminSection.properties')

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">{t('form.saleInformation')}</h3>
      </div>
      
      <FormField
        control={form.control}
        name="sale_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.price')}</FormLabel>
            <FormControl>
              <Input
                id="sale_price"
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
