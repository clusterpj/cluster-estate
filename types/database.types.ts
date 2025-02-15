export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: string | null;
          phone: string | null;
          bio: string | null;
          settings: {
            emailNotifications: boolean;
            bookingReminders: boolean;
            marketingEmails: boolean;
          } | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: string | null;
          phone?: string | null;
          bio?: string | null;
          settings?: {
            emailNotifications: boolean;
            bookingReminders: boolean;
            marketingEmails: boolean;
          } | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: string | null;
          phone?: string | null;
          bio?: string | null;
          settings?: {
            emailNotifications: boolean;
            bookingReminders: boolean;
            marketingEmails: boolean;
          } | null;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          location: string;
          bedrooms: number;
          bathrooms: number;
          square_feet: number;
          images: string[];
          features: string[];
          price: number;
          property_type: 'house' | 'apartment' | 'villa' | 'land' | null;
          rental_price: number | null;
          rental_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          status: 'available' | 'rented' | 'sold' | null;
          max_guests: number | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          location: string;
          bedrooms: number;
          bathrooms: number;
          square_feet: number;
          images: string[];
          features: string[];
          price: number;
          property_type?: 'house' | 'apartment' | 'villa' | 'land' | null;
          rental_price?: number | null;
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          status?: 'available' | 'rented' | 'sold' | null;
          max_guests?: number | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          location?: string;
          bedrooms?: number;
          bathrooms?: number;
          square_feet?: number;
          images?: string[];
          features?: string[];
          price?: number;
          property_type?: 'house' | 'apartment' | 'villa' | 'land' | null;
          rental_price?: number | null;
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          status?: 'available' | 'rented' | 'sold' | null;
          max_guests?: number | null;
          user_id?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          check_in: string;
          check_out: string;
          guests: number;
          total_price: number;
          status: string;
          payment_status: string;
          payment_id?: string;
          refund_id?: string;
          special_requests?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          check_in: string;
          check_out: string;
          guests: number;
          total_price: number;
          status?: string;
          payment_status?: string;
          payment_id?: string;
          refund_id?: string;
          special_requests?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          check_in?: string;
          check_out?: string;
          guests?: number;
          total_price?: number;
          status?: string;
          payment_status?: string;
          payment_id?: string;
          refund_id?: string;
          special_requests?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
