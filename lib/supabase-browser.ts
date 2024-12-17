import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

// Export a singleton instance for client-side usage
export const supabase = createBrowserClient()
