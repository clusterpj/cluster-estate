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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RentalInformationProps {
  form: UseFormReturn<PropertyFormValues>
}

export function RentalInformation({ form }: RentalInformationProps) {
  const t = useTranslations('auth.adminSection.properties')

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">{t('form.rentalInformation')}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          control={form.control}
          name="rental_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.rentalPrice')}</FormLabel>
              <FormControl>
                <Input
                  id="rental_price"
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

        <FormField
          control={form.control}
          name="rental_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.rentalFrequency')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectRentalFrequency')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">{t('rentalFrequency.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('rentalFrequency.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('rentalFrequency.monthly')}</SelectItem>
                  <SelectItem value="yearly">{t('rentalFrequency.yearly')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="minimum_rental_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.minimumRentalPeriod')}</FormLabel>
              <FormControl>
                <Input
                  id="minimum_rental_period"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deposit_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.depositAmount')}</FormLabel>
              <FormControl>
                <Input
                  id="deposit_amount"
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

      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="available_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.availableFrom')}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value || ''}
                  onChange={(e) => {
                    const date = e.target.value
                    console.log('Date input changed:', {
                      rawValue: date,
                      isoString: date
                    })
                    field.onChange(date)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.availableTo')}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
