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
          price: number
          property_type: 'house' | 'apartment' | 'villa' | 'land' | null
          rental_price: number | null
          rental_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          status: 'available' | 'rented' | 'sold' | null
          max_guests: number | null
          user_id: string
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
          images: string[]
          features: string[]
          price: number
          property_type?: 'house' | 'apartment' | 'villa' | 'land' | null
          rental_price?: number | null
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          status?: 'available' | 'rented' | 'sold' | null
          max_guests?: number | null
          user_id: string
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
          price?: number
          property_type?: 'house' | 'apartment' | 'villa' | 'land' | null
          rental_price?: number | null
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          status?: 'available' | 'rented' | 'sold' | null
          max_guests?: number | null
          user_id?: string
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status: string
          payment_status: string
          payment_id?: string
          refund_id?: string
          special_requests?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status?: string
          payment_status?: string
          payment_id?: string
          refund_id?: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          check_in?: string
          check_out?: string
          guests?: number
          total_price?: number
          status?: string
          payment_status?: string
          payment_id?: string
          refund_id?: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
      }
      booking_status_history: {
        Row: {
          id: string
          booking_id: string
          old_status: string
          new_status: string
          old_payment_status: string
          new_payment_status: string
          payment_id?: string
          refund_id?: string
          reason?: string
          created_at: string
          created_by?: string
        }
        Insert: {
          id?: string
          booking_id: string
          old_status: string
          new_status: string
          old_payment_status: string
          new_payment_status: string
          payment_id?: string
          refund_id?: string
          reason?: string
          created_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          booking_id?: string
          old_status?: string
          new_status?: string
          old_payment_status?: string
          new_payment_status?: string
          payment_id?: string
          refund_id?: string
          reason?: string
          created_at?: string
          created_by?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          event_type: string
          payload: Record<string, unknown>
          processed: boolean
          error?: string
          created_at: string
          processed_at?: string
        }
        Insert: {
          id?: string
          event_type: string
          payload: Record<string, unknown>
          processed?: boolean
          error?: string
          created_at?: string
          processed_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          payload?: Record<string, unknown>
          processed?: boolean
          error?: string
          created_at?: string
          processed_at?: string
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
