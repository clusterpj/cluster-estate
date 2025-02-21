export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'agent' | 'user'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'agent' | 'user'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'agent' | 'user'
          metadata?: Json
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string
          address: string
          city: string
          country: string
          postal_code: string
          latitude: number
          longitude: number
          sale_price: number | null
          rental_price: number | null
          rental_frequency: string | null
          bedrooms: number
          bathrooms: number
          square_feet: number
          status: 'available' | 'pending' | 'rented' | 'sold' | 'booked'
          property_type: 'house' | 'apartment' | 'villa' | 'land'
          listing_type: 'sale' | 'rent' | 'both'
          features: string[]
          created_at: string
          updated_at: string
          ical_url?: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description: string
          address: string
          city: string
          country: string
          postal_code: string
          latitude: number
          longitude: number
          sale_price?: number | null
          rental_price?: number | null
          rental_frequency?: string | null
          bedrooms: number
          bathrooms: number
          square_feet: number
          status?: 'available' | 'pending' | 'rented' | 'sold' | 'booked'
          property_type: 'house' | 'apartment' | 'villa' | 'land'
          listing_type: 'sale' | 'rent' | 'both'
          features?: string[]
          created_at?: string
          updated_at?: string
          ical_url?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string
          address?: string
          city?: string
          country?: string
          postal_code?: string
          latitude?: number
          longitude?: number
          sale_price?: number | null
          rental_price?: number | null
          rental_frequency?: string | null
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          status?: 'available' | 'pending' | 'rented' | 'sold' | 'booked'
          property_type?: 'house' | 'apartment' | 'villa' | 'land'
          listing_type?: 'sale' | 'rent' | 'both'
          features?: string[]
          updated_at?: string
          ical_url?: string
        }
      }
      calendar_feeds: {
        Row: {
          id: string
          property_id: string
          feed_url: string
          feed_type: 'import' | 'export'
          sync_frequency: number
          sync_enabled: boolean
          last_sync_at?: string
          last_sync_status?: 'success' | 'error'
          last_sync_result?: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          feed_url: string
          feed_type: 'import' | 'export'
          sync_frequency: number
          sync_enabled?: boolean
          last_sync_at?: string
          last_sync_status?: 'success' | 'error'
          last_sync_result?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          property_id?: string
          feed_url?: string
          feed_type?: 'import' | 'export'
          sync_frequency?: number
          sync_enabled?: boolean
          last_sync_at?: string
          last_sync_status?: 'success' | 'error'
          last_sync_result?: Json
          updated_at?: string
        }
      }
      property_availability: {
        Row: {
          id: string
          property_id: string
          start_date: string
          end_date: string
          description: string | null
          external_id: string | null
          status: 'available' | 'booked' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          start_date: string
          end_date: string
          description?: string | null
          external_id?: string | null
          status?: 'available' | 'booked' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          start_date?: string
          end_date?: string
          description?: string | null
          external_id?: string | null
          status?: 'available' | 'booked' | 'blocked'
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
