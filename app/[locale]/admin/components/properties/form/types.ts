import { PropertyFormValues } from './schema'
import type { Database } from '@/types/supabase'

export interface PropertyFormProps {
  onSuccess?: () => void
  onError?: (error: any) => void
  initialData?: Partial<PropertyFormValues> & {
    property_type?: PropertyType
  }
  mode?: 'create' | 'edit'
  propertyId?: string
}

export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
