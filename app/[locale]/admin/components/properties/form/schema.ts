import * as z from 'zod'
import type { Database } from '@/types/supabase'

export const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  sale_price: z.number().min(0, 'Sale price must be positive'),
  pets_allowed: z.boolean().default(false),
  pet_restrictions: z.array(z.string()).default([]),
  pet_deposit: z.number().min(0, 'Pet deposit must be positive').optional(),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().min(0, 'Number of bedrooms must be positive'),
  bathrooms: z.number().min(0, 'Number of bathrooms must be positive'),
  square_feet: z.number().min(0, 'Square feet must be positive'),
  status: z.enum(['available', 'pending', 'rented', 'sold', 'booked']).default('available'),
  listing_type: z.enum(['sale', 'rent', 'both']).default('sale'),
  property_type: z.enum(['house', 'apartment', 'villa', 'land']).nullable().default('house'),
  rental_price: z.number().min(0, 'Rental price must be positive').optional(),
  rental_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  minimum_rental_period: z.number().min(0, 'Minimum rental period must be positive').optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be positive').optional(),
  available_from: z.string().optional(),
  available_to: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>
