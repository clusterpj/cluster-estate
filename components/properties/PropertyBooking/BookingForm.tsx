import React from 'react'
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
  check_in: z.date({
    required_error: 'Check-in date is required',
  }),
  check_out: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number({
    required_error: 'Number of guests is required',
  }).min(1, 'At least 1 guest is required'),
  special_requests: z.string().optional(),
}).refine(data => data.check_out > data.check_in, {
  message: 'Check-out date must be after check-in date',
  path: ['check_out'],
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
      special_requests: '',
    },
  })

  const handleSubmit = (data: BookingFormData) => {
    // Check if dates are within property's available range
    if (property.available_from && new Date(data.check_in) < new Date(property.available_from)) {
      setDateError('Check-in date is before property availability')
      return
    }
    if (property.available_to && new Date(data.check_out) > new Date(property.available_to)) {
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
      const checkInDate = form.getValues('check_in')
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
            name="check_in"
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
            name="check_out"
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
          name="special_requests"
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
