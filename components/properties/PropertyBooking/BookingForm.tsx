import { useState } from 'react'
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
  }).min(1, 'At least 1 guest is required'),
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

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 1,
      specialRequests: '',
    },
  })

  const handleSubmit = (data: BookingFormData) => {
    // Check if dates are within property's available range
    if (property.available_from && data.checkIn < new Date(property.available_from)) {
      setDateError('Check-in date is before property availability')
      return
    }
    if (property.available_to && data.checkOut > new Date(property.available_to)) {
      setDateError('Check-out date is after property availability')
      return
    }

    setDateError('')
    onSubmit(data)
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Date</FormLabel>
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => isDateDisabled(date, 'checkIn')}
                    initialFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Date</FormLabel>
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => isDateDisabled(date, 'checkOut')}
                    initialFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {dateError && (
          <p className="text-sm font-medium text-destructive">{dateError}</p>
        )}

        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </form>
    </Form>
  )
}
