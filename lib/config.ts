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
  // Email configuration
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_APP_PASSWORD: z.string().optional(), // For backward compatibility
  EMAIL_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default('reservecabaretevillas@gmail.com'),
  EMAIL_SERVER: z.string().optional().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().optional().default('587'),
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
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  EMAIL_SERVER: process.env.EMAIL_SERVER,
  EMAIL_PORT: process.env.EMAIL_PORT,
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
  email: {
    user: env.data.EMAIL_USER,
    password: env.data.EMAIL_PASSWORD || env.data.EMAIL_APP_PASSWORD, // Try both variables
    appPassword: env.data.EMAIL_APP_PASSWORD,
    from: env.data.EMAIL_FROM,
    adminEmail: env.data.ADMIN_EMAIL,
    server: env.data.EMAIL_SERVER,
    port: env.data.EMAIL_PORT,
  },
}
