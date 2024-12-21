'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type PropertyInsert = Database['public']['Tables']['properties']['Insert']

const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().min(0, 'Number of bedrooms must be positive'),
  bathrooms: z.number().min(0, 'Number of bathrooms must be positive'),
  square_feet: z.number().min(0, 'Square feet must be positive'),
  status: z.enum(['available', 'sold', 'pending', 'rented']).default('available'),
  listing_type: z.enum(['sale', 'rent', 'both']).default('sale'),
  rental_price: z.number().min(0, 'Rental price must be positive').optional(),
  rental_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  minimum_rental_period: z.number().min(0, 'Minimum rental period must be positive').optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be positive').optional(),
  available_from: z.string().optional(),
  available_to: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

interface PropertyFormProps {
  onSuccess?: () => void
  onError?: (error: any) => void
  initialData?: PropertyFormValues
  mode?: 'create' | 'edit'
  propertyId?: string
}

export function PropertyForm({ 
  onSuccess, 
  onError, 
  initialData, 
  mode = 'create',
  propertyId 
}: PropertyFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const t = useTranslations('auth.adminSection.properties')
  const supabase = createClientComponentClient<Database>()

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      price: 0,
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      status: 'available',
      listing_type: 'sale',
      rental_price: 0,
      rental_frequency: undefined,
      minimum_rental_period: 0,
      deposit_amount: 0,
      available_from: '',
      available_to: '',
      features: [],
      images: [],
    },
  })

  const processPropertyData = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('No user found');
    }

    const formData = form.getValues();
    const { price, ...rest } = formData;
    
    const processedData = {
      ...rest,
      user_id: user.id,
      sale_price: formData.listing_type === 'sale' || formData.listing_type === 'both' ? price : null,
      rental_price: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.rental_price : null,
      legacy_price: price,
      rental_frequency: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.rental_frequency : null,
      minimum_rental_period: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.minimum_rental_period : null,
      deposit_amount: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.deposit_amount : null,
      available_from: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.available_from : null,
      available_to: formData.listing_type === 'rent' || formData.listing_type === 'both' ? formData.available_to : null,
      images: uploadedImages
    };
    return processedData;
  };

  async function onSubmit(data: PropertyFormValues) {
    console.log('Form submitted with data:', data);
    try {
      // Process the property data with user information
      const propertyData = await processPropertyData();
      console.log('Processing property data:', propertyData);

      const { data: savedProperty, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        console.error('Error saving property:', error);
        throw error;
      }

      console.log('Property saved successfully:', savedProperty);
      onSuccess?.();
    } catch (error) {
      console.error('Error in form submission:', error);
      onError?.(error);
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    try {
      console.log('Starting image upload for files:', files)
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `properties/${fileName}`;
        
        console.log('Uploading file:', filePath);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        console.log('Generated public URL:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      console.log('All images uploaded successfully:', uploadedUrls);
      setUploadedImages(uploadedUrls);
      console.log('Updated form images:', uploadedUrls);

    } catch (error) {
      console.error('Error uploading images:', error);
      onError?.(error);
    }
  }

  function handleFeatureAdd(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && event.currentTarget.value) {
      event.preventDefault()
      const newFeature = event.currentTarget.value.trim()
      const currentFeatures = form.getValues('features')
      
      if (newFeature && !currentFeatures.includes(newFeature)) {
        form.setValue('features', [...currentFeatures, newFeature])
        event.currentTarget.value = ''
      }
    }
  }

  function handleFeatureRemove(feature: string) {
    const currentFeatures = form.getValues('features')
    form.setValue('features', currentFeatures.filter(f => f !== feature))
  }

  function handleImageRemove(image: string) {
    const currentImages = uploadedImages
    setUploadedImages(currentImages.filter(img => img !== image))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t('form.title')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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

            <div className="grid grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.bedrooms')}</FormLabel>
                    <FormControl>
                      <Input
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sale Information */}
            {(form.watch('listing_type') === 'sale' || form.watch('listing_type') === 'both') && (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-lg">{t('form.saleInformation')}</h3>
                </div>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.salePrice')}</FormLabel>
                      <FormControl>
                        <Input
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
            )}

            {/* Rental Information */}
            {(form.watch('listing_type') === 'rent' || form.watch('listing_type') === 'both') && (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-lg">{t('form.rentalInformation')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="rental_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.rentalPrice')}</FormLabel>
                        <FormControl>
                          <Input
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
                    name="rental_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.rentalFrequency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            {...field}
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
            )}

            {/* Features and Images Section */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg">{t('form.additionalInformation')}</h3>
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
                          onKeyDown={handleFeatureAdd}
                        />
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((feature, index) => (
                            <Badge key={index} variant="secondary">
                              {feature}
                              <button
                                type="button"
                                onClick={() => handleFeatureRemove(feature)}
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
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.images')}</FormLabel>
                    <FormDescription>{t('form.imagesDescription')}</FormDescription>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
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
                                onClick={() => handleImageRemove(image)}
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
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">{t('form.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}
