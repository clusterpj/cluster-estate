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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BasicInformationProps {
  form: UseFormReturn<PropertyFormValues>
}

export function BasicInformation({ form }: BasicInformationProps) {
  const t = useTranslations('auth.adminSection.properties')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input id="title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.location')}</FormLabel>
              <FormControl>
                <Input id="location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.description')}</FormLabel>
            <FormControl>
              <Textarea className="min-h-[150px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.bedrooms')}</FormLabel>
              <FormControl>
                <Input
                  id="bedrooms"
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
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.bathrooms')}</FormLabel>
              <FormControl>
                <Input
                  id="bathrooms"
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
          name="square_feet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.squareFeet')}</FormLabel>
              <FormControl>
                <Input
                  id="square_feet"
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectStatus')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">{t('status.available')}</SelectItem>
                  <SelectItem value="sold">{t('status.sold')}</SelectItem>
                  <SelectItem value="pending">{t('status.pending')}</SelectItem>
                  <SelectItem value="rented">{t('status.rented')}</SelectItem>
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
          name="listing_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.listingType')}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  console.log('Select value changed:', {
                    field: field.name,
                    value
                  });
                  field.onChange(value);
                }} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectListingType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sale">{t('listingType.sale')}</SelectItem>
                  <SelectItem value="rent">{t('listingType.rent')}</SelectItem>
                  <SelectItem value="both">{t('listingType.both')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="property_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.propertyType')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectPropertyType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="house">{t('propertyType.house')}</SelectItem>
                  <SelectItem value="villa">{t('propertyType.villa')}</SelectItem>
                  <SelectItem value="condo">{t('propertyType.condo')}</SelectItem>
                  <SelectItem value="lot">{t('propertyType.lot')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
