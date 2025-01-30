import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ical, { CalendarComponent } from 'ical'
import { Database } from '@/types/database.types'

export type CalendarEvent = {
  start: Date
  end: Date
  summary: string
  uid: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
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

  async parseICalFeed(feedUrl: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(feedUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar feed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.text()
      const events = ical.parseICS(data)
      
      return Object.values(events)
        .filter((event): event is CalendarComponent => event.type === 'VEVENT')
        .map(event => {
          if (!event.start || !event.end) {
            throw new Error('Invalid calendar event: missing start/end dates')
          }
          
          return {
            start: event.start as Date,
            end: event.end as Date,
            summary: event.summary as string,
            uid: event.uid as string,
            status: event.status as 'confirmed' | 'tentative' | 'cancelled',
            description: event.description as string,
            location: event.location as string,
            organizer: event.organizer?.val as string,
            attendees: event.attendee?.map(a => a.val) as string[]
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
        .select('start_date, end_date')
        .eq('property_id', propertyId)
        .gte('end_date', new Date().toISOString())

      // Check for conflicts
      const conflicts = this.findBookingConflicts(events, existingBookings || [])
      if (conflicts.length > 0) {
        throw new Error(`Booking conflicts found: ${conflicts.length} overlapping events`)
      }

      // Update availability
      await this.supabase.from('property_availability')
        .upsert(events.map(event => ({
          property_id: propertyId,
          start_date: event.start,
          end_date: event.end,
          status: 'unavailable',
          source: 'calendar_sync',
          external_id: event.uid
        })))

      return { success: true }
    } catch (error) {
      console.error('Failed to update property availability:', error)
      throw error
    }
  }

  private findBookingConflicts(
    calendarEvents: CalendarEvent[],
    existingBookings: { start_date: string; end_date: string }[]
  ) {
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

  async processSyncJob(feedId: string) {
    try {
      // Get feed details
      const { data: feed } = await this.supabase
        .from('calendar_sync')
        .select('*, properties(*)')
        .eq('id', feedId)
        .single()

      if (!feed || !feed.sync_enabled) {
        return { success: false, error: 'Feed not found or disabled' }
      }

      // Parse and process events
      const events = await this.parseICalFeed(feed.feed_url)
      await this.updatePropertyAvailability(feed.property_id, events)

      // Update last sync timestamp
      await this.supabase
        .from('calendar_sync')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', feedId)

      return { success: true, eventsProcessed: events.length }
    } catch (error) {
      console.error('Failed to process sync job:', error)
      throw error
    }
  }
}

export const calendarSyncService = new CalendarSyncService()
