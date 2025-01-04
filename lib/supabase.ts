import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')

// Create single instance of Supabase client
let supabaseInstance: SupabaseClient<Database> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey || '')
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Create admin client only if service role key is available
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null

// Error types
export interface PostgrestError {
  code: string
  message: string
  details: string
}

export interface AuthError {
  message: string
  status: number
}

export interface SupabaseErrorDetails {}

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
