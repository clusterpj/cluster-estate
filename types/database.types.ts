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
          status: string
          property_type: string
          year_built: number
          parking_spaces: number
          lot_size: number
          user_id: string
          listing_type: 'sale' | 'rent' | 'both'
          sale_price: number | null
          rental_price: number | null
          rental_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
        }
      }
    }
  }
}
