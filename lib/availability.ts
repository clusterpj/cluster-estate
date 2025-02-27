import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Updates property availability based on booking changes
 * 
 * @param propertyId The ID of the property
 * @param checkIn Check-in date as ISO string
 * @param checkOut Check-out date as ISO string
 * @param isBooked Whether the property is being booked (true) or becoming available (false)
 */
export async function updatePropertyAvailability(
  propertyId: string, 
  checkIn: string, 
  checkOut: string, 
  isBooked: boolean
): Promise<void> {
  const supabase = createClient();
  
  try {
    // Convert the dates to actual Date objects
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    // Create an array of dates between check-in and check-out
    const dates = getDatesInRange(startDate, endDate);
    
    // For each date in the range, update the availability
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      await updateAvailabilityForDate(supabase, propertyId, dateStr, isBooked);
    }
    
    console.log(`✅ Successfully updated availability for property ${propertyId} from ${checkIn} to ${checkOut}`);
  } catch (error) {
    console.error('Error updating property availability:', error);
    throw error;
  }
}

/**
 * Updates availability for a specific date
 */
async function updateAvailabilityForDate(
  supabase: SupabaseClient<Database>,
  propertyId: string, 
  date: string, 
  isBooked: boolean
): Promise<void> {
  // First check if an entry exists for this date and property
  const { data: existing } = await supabase
    .from('property_availability')
    .select('*')
    .eq('property_id', propertyId)
    .eq('date', date)
    .single();
  
  if (existing) {
    // Update the existing record
    await supabase
      .from('property_availability')
      .update({ is_available: !isBooked })
      .eq('id', existing.id);
  } else {
    // Create a new availability record
    await supabase
      .from('property_availability')
      .insert({
        property_id: propertyId,
        date: date,
        is_available: !isBooked
      });
  }
}

/**
 * Get all dates between start and end date (inclusive)
 */
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Adjust end date to exclude check-out day if needed
  // For this example, we're including the check-out date in the range
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}
