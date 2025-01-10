import { useState, useEffect } from 'react'
import { isPropertyAvailable, getBookedDates } from '@/lib/utils'
import { PropertyCalendar } from './PropertyCalendar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookingFormData } from '@/types/booking'
import { Property } from '@/types/property'

const bookingSchema = z.object({
  checkIn: z.date({
    required_error: 'Check-in date is required',
  }),
  checkOut: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number({
    required_error: 'Number of guests is required',
  })
    .min(1, 'At least 1 guest is required')
    .max(property.max_guests || 10, `Maximum ${property.max_guests || 10} guests allowed`),
  specialRequests: z.string().optional(),
}).refine(data => data.checkOut > data.checkIn, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
})

interface BookingFormProps {
  property: Property
  onSubmit: (data: BookingFormData) => void
  isLoading?: boolean
}

export function BookingForm({ property, onSubmit, isLoading }: BookingFormProps) {
  const [dateError, setDateError] = useState<string>('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 1,
      specialRequests: '',
    },
  })

  const handleSubmit = async (data: BookingFormData) => {
    // Check if dates are within property's available range
    if (property.available_from && data.checkIn < new Date(property.available_from)) {
      setDateError('Check-in date is before property availability')
      return
    }
    if (property.available_to && data.checkOut > new Date(property.available_to)) {
      setDateError('Check-out date is after property availability')
      return
    }

    // Check minimum rental period
    if (property.minimum_rental_period) {
      const days = Math.ceil(
        (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (days < property.minimum_rental_period) {
        setDateError(`Minimum rental period is ${property.minimum_rental_period} days`)
        return
      }
    }

    // Check availability
    setIsCheckingAvailability(true)
    try {
      const available = await isPropertyAvailable(property.id, data.checkIn, data.checkOut)
      if (!available) {
        setDateError('Selected dates are not available')
        setIsAvailable(false)
        return
      }
      
      setDateError('')
      setIsAvailable(true)
      onSubmit(data)
    } catch (error) {
      setDateError('Error checking availability')
      console.error('Availability check failed:', error)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const isDateDisabled = (date: Date, type: 'checkIn' | 'checkOut'): boolean => {
    if (type === 'checkIn') {
      return (
        date < new Date() ||
        (property.available_from ? date < new Date(property.available_from) : false)
      )
    } else {
      const checkInDate = form.getValues('checkIn')
      return (
        date <= checkInDate ||
        (property.available_to ? date > new Date(property.available_to) : false)
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PropertyCalendar 
          property={property}
          onDateSelect={(date) => {
            if (!form.getValues('checkIn')) {
              form.setValue('checkIn', date)
            } else if (date > form.getValues('checkIn')) {
              form.setValue('checkOut', date)
            } else {
              // If selected date is before check-in, reset both dates
              form.setValue('checkIn', date)
              form.setValue('checkOut', null)
            }
          }}
          selectedDates={{
            start: form.watch('checkIn') || null,
            end: form.watch('checkOut') || null
          }}
        />

        {dateError && (
          <p className="text-sm font-medium text-destructive">{dateError}</p>
        )}

        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Number of Guests</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimum: 1 guest</p>
                      <p>Maximum: {property.max_guests || 10} guests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={property.max_guests || 10}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (value > (property.max_guests || 10)) {
                      field.onChange(property.max_guests || 10)
                    } else {
                      field.onChange(value)
                    }
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
              <FormLabel>Special Requests (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder="Please let us know if you have any special requirements or requests"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading || isCheckingAvailability}
          className={!isAvailable ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          {isCheckingAvailability ? 'Checking availability...' : 
           isLoading ? 'Processing...' : 
           !isAvailable ? 'Not Available' : 'Continue to Payment'}
        </Button>
      </form>
    </Form>
  )
}
