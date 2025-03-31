'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DateRangeCalendar } from './DateRangeCalendar'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Info, Calendar as CalendarIcon } from 'lucide-react'
import { BookingFormData } from '@/types/booking'
import { Property } from '@/types/property'
import { isPropertyAvailable } from '@/lib/utils'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  property: Property
  onSubmit: (data: BookingFormData) => void
  isLoading?: boolean
}

export function BookingForm({ property, onSubmit, isLoading }: BookingFormProps) {
  const [dateError, setDateError] = useState<string>('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)

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

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 1,
      specialRequests: '',
    },
  })

  const handleSubmit = async (data: BookingFormData) => {
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

  const handleDateRangeSelect = (range: { checkIn: Date; checkOut: Date }) => {
    form.setValue('checkIn', range.checkIn)
    form.setValue('checkOut', range.checkOut)
    setDateError('')
    setCalendarOpen(false)
  }

  const checkIn = form.watch('checkIn')
  const checkOut = form.watch('checkOut')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-auto p-4",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn && checkOut ? (
                  <div className="flex flex-col items-start">
                    <div className="text-sm">
                      {format(checkIn, "LLL d, y")} - {format(checkOut, "LLL d, y")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                    </div>
                  </div>
                ) : (
                  <span>Select dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangeCalendar
                property={property}
                onRangeSelect={handleDateRangeSelect}
                selected={{
                  from: checkIn,
                  to: checkOut
                }}
              />
            </PopoverContent>
          </Popover>

          {dateError && (
            <p className="text-sm font-medium text-destructive">{dateError}</p>
          )}
        </div>

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
