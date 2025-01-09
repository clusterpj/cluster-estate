'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/utils/supabase-client'
import { isPropertyAvailable, calculateTotalPrice } from '@/lib/utils'
import { BookingFormData, BookingStatus } from '@/types/booking'
import { Property } from '@/types/property'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { bookingFormSchema } from '@/lib/validations/booking'

interface BookingFormProps {
  property: Property
  onSuccess?: () => void
}

export function BookingForm({ property, onSuccess }: BookingFormProps) {
  const t = useTranslations('bookings')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000), // Default to 1 day
      guests: 1,
      specialRequests: '',
    },
  })

  const calculatePrice = async (checkIn: Date, checkOut: Date) => {
    if (!property.rental_price || !property.rental_frequency) return 0
    
    const price = calculateTotalPrice({
      checkIn,
      checkOut,
      rentalPrice: property.rental_price,
      rentalFrequency: property.rental_frequency,
    })
    
    setTotalPrice(price)
    return price
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    
    try {
      // Check property availability
      const isAvailable = await isPropertyAvailable(
        property.id,
        data.checkIn,
        data.checkOut
      )
      
      if (!isAvailable) {
        toast({
          variant: 'destructive',
          title: t('form.errors.unavailable'),
          description: t('form.errors.unavailableDescription'),
        })
        return
      }

      // Create booking
      const supabase = createClient()
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          check_in: data.checkIn.toISOString(),
          check_out: data.checkOut.toISOString(),
          guests: data.guests,
          total_price: totalPrice,
          status: 'pending' as BookingStatus,
          special_requests: data.specialRequests,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: t('form.success.title'),
        description: t('form.success.description'),
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        variant: 'destructive',
        title: t('form.errors.title'),
        description: t('form.errors.description'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('form.checkIn')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        calculatePrice(date, form.getValues('checkOut'))
                      }}
                      disabled={(date) =>
                        date < new Date() || date > new Date('2100-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('form.checkOut')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        calculatePrice(form.getValues('checkIn'), date)
                      }}
                      disabled={(date) =>
                        date < form.getValues('checkIn') ||
                        date > new Date('2100-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.guests')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={property.max_guests || 10}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    form.trigger('guests')
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.specialRequests')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.specialRequestsPlaceholder')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('form.totalPrice')}
            </p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalPrice)}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('form.submitting') : t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
