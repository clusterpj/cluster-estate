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
          location: string
          bedrooms: number
          bathrooms: number
          square_feet: number
          images: string[]
          features: string[]
          status: 'available' | 'sold' | 'pending' | 'rented'
          user_id: string
          listing_type: 'sale' | 'rent' | 'both'
          sale_price: number | null
          rental_price: number | null
          rental_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          minimum_rental_period: number | null
          deposit_amount: number | null
          available_from: string | null
          available_to: string | null
          property_type: 'house' | 'villa' | 'condo' | 'lot' | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          location: string
          bedrooms: number
          bathrooms: number
          square_feet: number
          images?: string[]
          features?: string[]
          status?: 'available' | 'sold' | 'pending' | 'rented'
          user_id: string
          listing_type?: 'sale' | 'rent' | 'both'
          sale_price?: number | null
          rental_price?: number | null
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          minimum_rental_period?: number | null
          deposit_amount?: number | null
          available_from?: string | null
          available_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          location?: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          images?: string[]
          features?: string[]
          status?: 'available' | 'sold' | 'pending' | 'rented'
          user_id?: string
          listing_type?: 'sale' | 'rent' | 'both'
          sale_price?: number | null
          rental_price?: number | null
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          minimum_rental_period?: number | null
          deposit_amount?: number | null
          available_from?: string | null
          available_to?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id: string | null
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | null
          special_requests: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | null
          special_requests?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string
          user_id?: string
          check_in?: string
          check_out?: string
          guests?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | null
          special_requests?: string | null
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
  }
}
