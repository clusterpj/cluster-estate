import { Database } from './supabase'

export type Property = Database['public']['Tables']['properties']['Row']
