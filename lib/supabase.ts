import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Client-side Supabase client (with auth)
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client (with auth)
export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
}

// Admin client with service role (for backend operations)
export const supabaseAdmin = createSupabaseClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
)

// Error handling types
type PostgrestError = {
  code: string
  message: string
  details: string
}

type AuthError = {
  message: string
  status: number
}

type SupabaseErrorDetails = PostgrestError | AuthError | unknown

// Error handling utility
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: SupabaseErrorDetails
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// Helper to handle Supabase errors
export const handleSupabaseError = (error: SupabaseErrorDetails): never => {
  console.error('Supabase Error:', error)
  
  // Type guard for Postgres errors
  const isPostgrestError = (err: unknown): err is PostgrestError => {
    return typeof err === 'object' && err !== null && 'code' in err
  }
  
  if (isPostgrestError(error)) {
    if (error.code === 'PGRST116') {
      throw new SupabaseError('Resource not found', error.code, error)
    }
    
    if (error.code.startsWith('P')) {
      throw new SupabaseError('Database error', error.code, error)
    }
    
    if (error.code === '23505') {
      throw new SupabaseError('Duplicate record', error.code, error)
    }
    
    if (error.code === '42P01') {
      throw new SupabaseError('Table not found', error.code, error)
    }
  }
  
  // Handle auth errors
  const error_msg = error instanceof Error ? error.message : String(error)
  if (error_msg.includes('JWT')) {
    throw new SupabaseError('Authentication error', 'AUTH_ERROR', error)
  }
  
  throw new SupabaseError(
    'An unexpected error occurred',
    'UNKNOWN',
    error
  )
}
