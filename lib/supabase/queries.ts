import { createClient } from '@/lib/supabase/server'
import { Property, Booking } from '@/types'

export async function getPropertyWithBookings(propertyId: string) {
  const supabase = createClient()

  // Get property details
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (propertyError) {
    console.error('Error fetching property:', propertyError)
    throw propertyError
  }

  // Get all bookings for this property
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .order('check_in', { ascending: true })

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError)
    throw bookingsError
  }

  // Get availability settings
  const { data: availability, error: availabilityError } = await supabase
    .from('property_availability')
    .select('*')
    .eq('property_id', propertyId)
    .single()

  if (availabilityError) {
    console.error('Error fetching availability:', availabilityError)
    throw availabilityError
  }

  return {
    property,
    bookings,
    availability
  }
}

export async function getBookedDates(propertyId: string): Promise<Date[]> {
  const supabase = createClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('property_id', propertyId)
    .order('check_in', { ascending: true })

  if (error) {
    console.error('Error fetching booked dates:', error)
    throw error
  }

  const bookedDates: Date[] = []
  bookings.forEach(booking => {
    const start = new Date(booking.check_in)
    const end = new Date(booking.check_out)
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.push(new Date(d))
    }
  })

  return bookedDates
}
