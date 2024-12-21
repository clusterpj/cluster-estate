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
      properties: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price: number
          location: string
          bedrooms: number
          bathrooms: number
          square_feet: number
          images: string[]
          features: string[]
          featured: boolean
          status: 'available' | 'sold' | 'pending' | 'rented'
          listing_type: 'sale' | 'rent' | 'both'
          rental_price?: number
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          minimum_rental_period?: number
          deposit_amount?: number
          available_from?: string
          available_to?: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          location: string
          bedrooms: number
          bathrooms: number
          square_feet: number
          images?: string[]
          features?: string[]
          featured?: boolean
          status?: 'available' | 'sold' | 'pending' | 'rented'
          listing_type?: 'sale' | 'rent' | 'both'
          rental_price?: number
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          minimum_rental_period?: number
          deposit_amount?: number
          available_from?: string
          available_to?: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          location?: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          images?: string[]
          features?: string[]
          featured?: boolean
          status?: 'available' | 'sold' | 'pending' | 'rented'
          listing_type?: 'sale' | 'rent' | 'both'
          rental_price?: number
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          minimum_rental_period?: number
          deposit_amount?: number
          available_from?: string
          available_to?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'user' | 'agent' | 'admin'
          phone: string | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'user' | 'agent' | 'admin'
          phone?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'user' | 'agent' | 'admin'
          phone?: string | null
          bio?: string | null
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
