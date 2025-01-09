import { z } from 'zod'

export const bookingFormSchema = z.object({
  checkIn: z.date({
    required_error: 'Check-in date is required',
  }),
  checkOut: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number().min(1, 'At least 1 guest is required'),
  specialRequests: z.string().optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
