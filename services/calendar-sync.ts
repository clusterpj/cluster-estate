import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ical, { CalendarComponent } from 'ical'
import { Database } from '@/types/database.types'

export type CalendarEvent = {
  start: Date
  end: Date
  summary: string
  uid: string
  status?: 'confirmed' | 'tentative' | 'canceled'
  description?: string
  location?: string
  organizer?: string
  attendees?: string[]
}

export type SyncResult = {
  success: boolean
  eventsProcessed: number
  conflicts?: CalendarEvent[]
  warnings?: string[]
  lastSync?: Date
}

export class CalendarSyncService {
  private supabase = createClientComponentClient<Database>()

  async getCalendarFeeds(propertyId: string) {
    const { data, error } = await this.supabase
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

  async createCalendarFeed(propertyId: string, feed: Omit<Database['public']['Tables']['calendar_feeds']['Insert'], 'id' | 'property_id'>) {
    const { data, error } = await this.supabase
      .from('calendar_feeds')
      .insert({
        ...feed,
        property_id: propertyId,
        sync_enabled: true,
        last_sync_status: null,
        last_sync_result: { eventsProcessed: 0 }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar feed:', error)
      throw new Error('Failed to create calendar feed')
    }
    return data
  }

  async updateCalendarFeed(propertyId: string, feedId: string, updates: Database['public']['Tables']['calendar_feeds']['Update']) {
    const { data, error } = await this.supabase
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

  async deleteCalendarFeed(propertyId: string, feedId: string) {
    const { error } = await this.supabase
      .from('calendar_feeds')
      .delete()
      .eq('id', feedId)
      .eq('property_id', propertyId)

    if (error) {
      console.error('Error deleting calendar feed:', error)
      throw new Error('Failed to delete calendar feed')
    }
  }

  async parseICalFeed(feedUrl: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(feedUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar feed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.text()
      const events = ical.parseICS(data)
      
      return Object.values(events)
        .filter((event): event is CalendarComponent => {
          return event.type === 'VEVENT' && event.start instanceof Date && event.end instanceof Date
        })
        .map(event => {
          return {
            start: event.start!,
            end: event.end!,
            summary: event.summary || '',
            uid: event.uid || crypto.randomUUID(),
            status: (event.status || 'confirmed') as 'confirmed' | 'tentative' | 'canceled',
            description: event.description,
            location: event.location,
            organizer: typeof event.organizer === 'object' ? event.organizer.val : event.organizer,
            attendees: Array.isArray(event.attendee) 
              ? event.attendee.map(a => typeof a === 'object' ? a.val : String(a))
              : event.attendee 
                ? [typeof event.attendee === 'object' ? event.attendee.val : String(event.attendee)]
                : undefined
          }
        })
    } catch (error) {
      console.error('Failed to parse iCal feed:', error)
      throw new Error('Failed to parse iCal feed')
    }
  }

  async updatePropertyAvailability(propertyId: string, events: CalendarEvent[]) {
    try {
      // First, get existing bookings for conflict check
      const { data: existingBookings } = await this.supabase
        .from('bookings')
        .select('start_date:check_in, end_date:check_out')
        .eq('property_id', propertyId)
        .gte('check_out', new Date().toISOString())

      // Check for conflicts
      const conflicts = this.findBookingConflicts(events, existingBookings || [])
      
      // Get existing availability entries for this property
      const { data: existingAvailability } = await this.supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', propertyId)
        .eq('source', 'calendar_sync')

      // Delete old availability entries
      if (existingAvailability?.length) {
        await this.supabase
          .from('property_availability')
          .delete()
          .eq('property_id', propertyId)
          .eq('source', 'calendar_sync')
      }

      // Insert new availability entries
      await this.supabase
        .from('property_availability')
        .upsert(events.map(event => ({
          property_id: propertyId,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          status: 'unavailable',
          source: 'calendar_sync',
          external_id: event.uid
        })))

      return {
        success: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      }
    } catch (error) {
      console.error('Failed to update property availability:', error)
      throw error
    }
  }

  private findBookingConflicts(
    calendarEvents: CalendarEvent[],
    existingBookings: { start_date: string; end_date: string }[]
  ): CalendarEvent[] {
    return calendarEvents.filter(event => 
      existingBookings.some(booking => 
        this.datesOverlap(
          new Date(booking.start_date),
          new Date(booking.end_date),
          event.start,
          event.end
        )
      )
    )
  }

  private datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 <= end2 && start2 <= end1
  }

  async processSyncJob(feedId: string): Promise<SyncResult> {
    try {
      // Get feed details
      const { data: feed } = await this.supabase
        .from('calendar_feeds')
        .select('*')
        .eq('id', feedId)
        .single()

      if (!feed || !feed.sync_enabled) {
        throw new Error('Feed not found or disabled')
      }

      // Parse and process events
      const events = await this.parseICalFeed(feed.feed_url)
      const result = await this.updatePropertyAvailability(feed.property_id, events)

      // Update last sync timestamp and status
      const now = new Date()
      await this.updateCalendarFeed(feed.property_id, feed.id, {
        last_sync_at: now.toISOString(),
        last_sync_status: result.success ? 'success' : 'error',
        last_sync_result: {
          eventsProcessed: events.length,
          conflicts: result.conflicts?.length,
          warnings: result.conflicts?.length ? [`Found ${result.conflicts.length} booking conflicts`] : undefined
        }
      })

      return {
        success: result.success,
        eventsProcessed: events.length,
        conflicts: result.conflicts,
        lastSync: now
      }
    } catch (error) {
      console.error('Failed to process sync job:', error)
      throw error
    }
  }
}

export const calendarSyncService = new CalendarSyncService()
