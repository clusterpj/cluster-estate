export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      booking_status_history: {
        Row: {
          booking_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          new_payment_status: string
          new_status: string
          old_payment_status: string
          old_status: string
          payment_id: string | null
          reason: string | null
          refund_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_payment_status: string
          new_status: string
          old_payment_status: string
          old_status: string
          payment_id?: string | null
          reason?: string | null
          refund_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_payment_status?: string
          new_status?: string
          old_payment_status?: string
          old_status?: string
          payment_id?: string | null
          reason?: string | null
          refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          calendar_event_id: string | null
          cancellation_date: string | null
          cancellation_reason: string | null
          check_in: string
          check_out: string
          confirmation_token: string | null
          created_at: string
          currency: string
          expires_at: string | null
          external_id: string | null
          external_source: string | null
          guests: number
          id: string
          is_external: boolean
          payment_date: string | null
          payment_id: string | null
          payment_intent_id: string | null
          payment_method: string
          payment_status: string | null
          property: Json | null
          property_id: string
          recurrence_rule: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          timezone: string
          total_amount: number
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          check_in: string
          check_out: string
          confirmation_token?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          guests: number
          id?: string
          is_external?: boolean
          payment_date?: string | null
          payment_id?: string | null
          payment_intent_id?: string | null
          payment_method?: string
          payment_status?: string | null
          property?: Json | null
          property_id: string
          recurrence_rule?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          timezone?: string
          total_amount?: number
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_event_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          check_in?: string
          check_out?: string
          confirmation_token?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          guests?: number
          id?: string
          is_external?: boolean
          payment_date?: string | null
          payment_id?: string | null
          payment_intent_id?: string | null
          payment_method?: string
          payment_status?: string | null
          property?: Json | null
          property_id?: string
          recurrence_rule?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          timezone?: string
          total_amount?: number
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_feeds: {
        Row: {
          created_at: string
          feed_type: string
          feed_url: string
          id: string
          last_sync_at: string | null
          last_sync_result: Json | null
          last_sync_status: string | null
          priority: number
          property_id: string
          sync_enabled: boolean
          sync_frequency: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          feed_type: string
          feed_url: string
          id?: string
          last_sync_at?: string | null
          last_sync_result?: Json | null
          last_sync_status?: string | null
          priority?: number
          property_id: string
          sync_enabled?: boolean
          sync_frequency: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          feed_type?: string
          feed_url?: string
          id?: string
          last_sync_at?: string | null
          last_sync_result?: Json | null
          last_sync_status?: string | null
          priority?: number
          property_id?: string
          sync_enabled?: boolean
          sync_frequency?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_feeds_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          available_from: string | null
          available_to: string | null
          bathrooms: number
          bedrooms: number
          calendar_settings: Json | null
          created_at: string
          default_timezone: string
          deposit_amount: number | null
          description: string
          featured: boolean | null
          features: string[] | null
          id: string
          images: string[] | null
          legacy_price: number | null
          listing_type: string
          location: string
          minimum_rental_period: number | null
          pet_deposit: number | null
          pet_restrictions: string[] | null
          pets_allowed: boolean | null
          property_type: string | null
          rental_frequency: string | null
          rental_price: number | null
          sale_price: number | null
          square_feet: number
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          bathrooms: number
          bedrooms: number
          calendar_settings?: Json | null
          created_at?: string
          default_timezone?: string
          deposit_amount?: number | null
          description: string
          featured?: boolean | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          legacy_price?: number | null
          listing_type?: string
          location: string
          minimum_rental_period?: number | null
          pet_deposit?: number | null
          pet_restrictions?: string[] | null
          pets_allowed?: boolean | null
          property_type?: string | null
          rental_frequency?: string | null
          rental_price?: number | null
          sale_price?: number | null
          square_feet: number
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          bathrooms?: number
          bedrooms?: number
          calendar_settings?: Json | null
          created_at?: string
          default_timezone?: string
          deposit_amount?: number | null
          description?: string
          featured?: boolean | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          legacy_price?: number | null
          listing_type?: string
          location?: string
          minimum_rental_period?: number | null
          pet_deposit?: number | null
          pet_restrictions?: string[] | null
          pets_allowed?: boolean | null
          property_type?: string | null
          rental_frequency?: string | null
          rental_price?: number | null
          sale_price?: number | null
          square_feet?: number
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availability: {
        Row: {
          created_at: string
          end_date: string
          external_id: string | null
          feed_id: string | null
          feed_priority: number | null
          id: string
          property_id: string
          source: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          external_id?: string | null
          feed_id?: string | null
          feed_priority?: number | null
          id?: string
          property_id: string
          source: string
          start_date: string
          status: string
        }
        Update: {
          created_at?: string
          end_date?: string
          external_id?: string | null
          feed_id?: string | null
          feed_priority?: number | null
          id?: string
          property_id?: string
          source?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "calendar_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availability_rules: {
        Row: {
          end_date: string | null
          id: string
          pattern: Json | null
          property_id: string | null
          rule_type: string | null
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id: string
          pattern?: Json | null
          property_id?: string | null
          rule_type?: string | null
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          pattern?: Json | null
          property_id?: string | null
          rule_type?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rates: {
        Row: {
          end_date: string | null
          id: string
          min_stay: number | null
          property_id: string | null
          rate: number | null
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id: string
          min_stay?: number | null
          property_id?: string | null
          rate?: number | null
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          min_stay?: number | null
          property_id?: string | null
          rate?: number | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_rates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_translations: {
        Row: {
          created_at: string
          description_en: string | null
          description_es: string | null
          id: string
          property_id: string | null
          title_en: string | null
          title_es: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          property_id?: string | null
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          property_id?: string | null
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_translations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          target_language: string
          text: string
          translation: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_language: string
          text: string
          translation: string
        }
        Update: {
          created_at?: string
          id?: string
          target_language?: string
          text?: string
          translation?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          id: string
          event_type: string
          payload: Json
          created_at: string | null
          processed: boolean | null
          processed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          event_type: string
          payload: Json
          created_at?: string | null
          processed?: boolean | null
          processed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          payload?: Json
          created_at?: string | null
          processed?: boolean | null
          processed_at?: string | null
          error?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_by_id: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      setup_test_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          property_id: string
        }[]
      }
      update_profile: {
        Args: {
          user_id: string
          profile_data: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "expired"
        | "canceled"
        | "payment_failed"
      bookingstatus: "pending" | "confirmed" | "modified" | "cancelled"
      propertyTypeEnums: "house" | "villa" | "condo" | "lot"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
