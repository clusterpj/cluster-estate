import { supabase } from '@/lib/supabase'

export type CalendarFeed = {
  id: string
  property_id: string
  feed_url: string
  feed_type: "import" | "export"
  sync_frequency: number
  sync_enabled: boolean
  last_sync_at?: string
  last_sync_status?: 'success' | 'error'
  last_sync_result?: {
    eventsProcessed: number
    conflicts?: number
    warnings?: string[]
  }
  created_at: string
  updated_at: string
}

export const getCalendarFeeds = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('calendar_feeds')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching calendar feeds:', error)
    throw new Error('Failed to fetch calendar feeds')
  }
  return data
}

export const createCalendarFeed = async (propertyId: string, feed: Omit<CalendarFeed, 'id'>) => {
  const { data, error } = await supabase
    .from('calendar_feeds')
    .insert({ ...feed, property_id: propertyId })
    .select()
    .single()

  if (error) {
    console.error('Error creating calendar feed:', error)
    throw new Error('Failed to create calendar feed')
  }
  return data
}

export const updateCalendarFeed = async (propertyId: string, feedId: string, updates: Partial<CalendarFeed>) => {
  const { data, error } = await supabase
    .from('calendar_feeds')
    .update(updates)
    .eq('id', feedId)
    .eq('property_id', propertyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating calendar feed:', error)
    throw new Error('Failed to update calendar feed')
  }
  return data
}

export const deleteCalendarFeed = async (propertyId: string, feedId: string) => {
  const { error } = await supabase
    .from('calendar_feeds')
    .delete()
    .eq('id', feedId)
    .eq('property_id', propertyId)

  if (error) {
    console.error('Error deleting calendar feed:', error)
    throw new Error('Failed to delete calendar feed')
  }
}
