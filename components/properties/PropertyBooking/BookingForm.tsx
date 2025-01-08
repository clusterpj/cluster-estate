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
    if (property.available_from && new Date(data.checkIn) < new Date(property.available_from)) {
      setDateError('Check-in date is before property availability')
      return
    }
    if (property.available_to && new Date(data.checkOut) > new Date(property.available_to)) {
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
}'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Define form schema
const formSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1),
})

type BookingFormValues = z.infer<typeof formSchema>

interface BookingFormProps {
  propertyId: string
  onSubmit: (values: BookingFormValues) => void
}

export function BookingForm({ propertyId, onSubmit }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: new Date(),
      checkOut: new Date(),
      guests: 1,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-in Date</FormLabel>
              <FormControl>
                <Controller
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date: Date | undefined) => field.onChange(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  )}
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
            <FormItem className="flex flex-col">
              <FormLabel>Check-out Date</FormLabel>
              <FormControl>
                <Controller
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date: Date | undefined) => field.onChange(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Book Now</Button>
      </form>
    </Form>
  )
}
