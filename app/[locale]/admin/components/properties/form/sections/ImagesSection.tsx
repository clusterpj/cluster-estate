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
import { X } from 'lucide-react'
import { useImageUpload } from '../hooks/useImageUpload'

interface ImagesSectionProps {
  form: UseFormReturn<PropertyFormValues>
  onError?: (error: any) => void
}

export function ImagesSection({ form, onError }: ImagesSectionProps) {
  const t = useTranslations('auth.adminSection.properties')
  const { uploadedImages, handleImageUpload, handleImageRemove } = useImageUpload(
    form.getValues('images'),
    onError
  )

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">{t('form.images')}</h3>
      </div>
      
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.images')}</FormLabel>
            <FormDescription>{t('form.imagesDescription')}</FormDescription>
            <FormControl>
              <div className="space-y-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={async (e) => {
                    if (e.target.files) {
                      await handleImageUpload(e.target.files)
                      field.onChange([...uploadedImages])
                    }
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleImageRemove(image)
                          field.onChange(uploadedImages.filter(img => img !== image))
                        }}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
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
