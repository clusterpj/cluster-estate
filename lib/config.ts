import { z } from 'zod'

// Define schema for environment variables
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  PAYPAL_CLIENT_ID: z.string().min(1),
  PAYPAL_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
})

// Validate environment variables
const env = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
})

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format())
  throw new Error('Invalid environment variables')
}

// Export validated environment variables
export const config = {
  siteUrl: env.data.NEXT_PUBLIC_SITE_URL,
  paypal: {
    clientId: env.data.PAYPAL_CLIENT_ID,
    clientSecret: env.data.PAYPAL_CLIENT_SECRET,
  },
  supabase: {
    url: env.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.data.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.data.SUPABASE_JWT_SECRET,
  },
}
