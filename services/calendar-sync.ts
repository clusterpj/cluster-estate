import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'
import { CalendarEvent, SyncResult } from '@/types/calendar'
import { parseICalendarData } from '@/lib/calendar'

export class CalendarSyncService {
  private supabase = createClientComponentClient<Database>()

  async getCalendarFeeds(propertyId: string) {
    console.log('[CalendarSync] Fetching feeds for property:', propertyId)
    const { data, error } = await this.supabase
      .from('calendar_feeds')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CalendarSync] Error fetching calendar feeds:', error)
      throw new Error('Failed to fetch calendar feeds')
    }
    console.log('[CalendarSync] Found feeds:', data)
    return data
  }

  async createCalendarFeed(propertyId: string, feed: Omit<Database['public']['Tables']['calendar_feeds']['Insert'], 'id' | 'property_id'>) {
    console.log('[CalendarSync] Creating new feed for property:', propertyId, 'Feed data:', feed)
    try {
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

      if (error) throw error
      console.log('[CalendarSync] Successfully created feed:', data)
      return data
    } catch (err) {
      console.error('[CalendarSync] Error creating calendar feed:', err)
      throw new Error('Failed to create calendar feed')
    }
  }

  async updateCalendarFeed(
    propertyId: string,
    feedId: string,
    updates: Partial<Database['public']['Tables']['calendar_feeds']['Update']>
  ) {
    try {
      console.log('[CalendarSync] Updating feed:', feedId, 'property:', propertyId, 'Updates:', updates)
      const { data, error } = await this.supabase
        .from('calendar_feeds')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedId)
        .eq('property_id', propertyId)
        .select()
        .single()

      if (error) throw error
      console.log('[CalendarSync] Successfully updated feed:', data)
      return data
    } catch (err) {
      console.error('[CalendarSync] Error updating calendar feed:', err)
      throw new Error('Failed to update calendar feed')
    }
  }

  async deleteCalendarFeed(propertyId: string, feedId: string) {
    try {
      console.log('[CalendarSync] Deleting feed:', feedId, 'property:', propertyId)
      const { error } = await this.supabase
        .from('calendar_feeds')
        .delete()
        .eq('id', feedId)
        .eq('property_id', propertyId)

      if (error) throw error
      console.log('[CalendarSync] Successfully deleted feed:', feedId)
    } catch (err) {
      console.error('[CalendarSync] Error deleting calendar feed:', err)
      throw new Error('Failed to delete calendar feed')
    }
  }

  async syncCalendarFeed(propertyId: string, feedId: string): Promise<SyncResult> {
    console.log('[CalendarSync] Starting sync for feed:', feedId, 'property:', propertyId)
    try {
      // Get the feed
      const { data: feed, error: feedError } = await this.supabase
        .from('calendar_feeds')
        .select('*')
        .eq('id', feedId)
        .eq('property_id', propertyId)
        .single()

      if (feedError || !feed) {
        console.error('[CalendarSync] Feed not found:', feedError)
        throw new Error('Feed not found')
      }

      console.log('[CalendarSync] Found feed to sync:', feed)

      // Parse events from the feed
      console.log('[CalendarSync] Fetching events from URL:', feed.feed_url)
      const response = await fetch(feed.feed_url)
      if (!response.ok) {
        throw new Error(`Failed to fetch iCal feed: ${response.statusText}`)
      }

      const icalData = await response.text()
      console.log('[CalendarSync] Received iCal data, length:', icalData.length)
      
      const events = parseICalendarData(icalData)
      console.log('[CalendarSync] Parsed events:', events.length)

      // Update sync status
      const result: SyncResult = {
        success: true,
        eventsProcessed: events.length,
        lastSync: new Date(),
        warnings: []
      }

      console.log('[CalendarSync] Sync completed successfully:', result)

      await this.updateCalendarFeed(propertyId, feedId, {
        last_sync_at: result.lastSync.toISOString(),
        last_sync_status: 'success',
        last_sync_result: result
      })

      return result
    } catch (err) {
      console.error('[CalendarSync] Error during sync:', err)
      const errorResult: SyncResult = {
        success: false,
        eventsProcessed: 0,
        warnings: [err instanceof Error ? err.message : 'Unknown error occurred'],
        lastSync: new Date()
      }

      await this.updateCalendarFeed(propertyId, feedId, {
        last_sync_at: errorResult.lastSync.toISOString(),
        last_sync_status: 'error',
        last_sync_result: errorResult
      })

      throw err
    }
  }

  private datesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1
  }

  private findBookingConflicts(
    calendarEvents: CalendarEvent[],
    existingBookings: { start_date: string; end_date: string }[]
  ): CalendarEvent[] {
    console.log('[CalendarSync] Checking for booking conflicts:', calendarEvents.length, existingBookings.length)
    return calendarEvents.filter(event => 
      existingBookings.some(booking => 
        this.datesOverlap(
          event.start,
          event.end,
          new Date(booking.start_date),
          new Date(booking.end_date)
        )
      )
    )
  }

  async updatePropertyAvailability(propertyId: string, events: CalendarEvent[]) {
    try {
      console.log('[CalendarSync] Updating property availability for property:', propertyId, 'Events:', events.length)
      // First, get existing bookings for conflict check
      const { data: existingBookings } = await this.supabase
        .from('bookings')
        .select('start_date,end_date')
        .eq('property_id', propertyId)

      // Check for conflicts
      const conflicts = this.findBookingConflicts(events, existingBookings || [])
      
      console.log('[CalendarSync] Found conflicts:', conflicts.length)

      // Get existing availability entries for this property
      const { data: existingAvailability } = await this.supabase
        .from('property_availability')
        .select('id')
        .eq('property_id', propertyId)

      // Delete old availability entries
      if (existingAvailability?.length) {
        console.log('[CalendarSync] Deleting old availability entries:', existingAvailability.length)
        await this.supabase
          .from('property_availability')
          .delete()
          .eq('property_id', propertyId)
      }

      // Insert new availability entries
      console.log('[CalendarSync] Inserting new availability entries:', events.length)
      await this.supabase
        .from('property_availability')
        .upsert(events.map(event => ({
          property_id: propertyId,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          status: event.status || 'confirmed',
          external_id: event.uid
        })))

      console.log('[CalendarSync] Successfully updated property availability')
      return {
        success: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      }
    } catch (error) {
      console.error('[CalendarSync] Failed to update property availability:', error)
      throw error
    }
  }

  async processSyncJob(feedId: string): Promise<SyncResult> {
    console.log('[CalendarSync] Starting sync job for feed:', feedId)
    try {
      // Get feed details
      const { data: feed } = await this.supabase
        .from('calendar_feeds')
        .select('*')
        .eq('id', feedId)
        .single()

      if (!feed || !feed.sync_enabled) {
        console.error('[CalendarSync] Feed not found or disabled:', feedId)
        throw new Error('Feed not found or disabled')
      }

      console.log('[CalendarSync] Found feed to sync:', feed)

      // Parse and process events
      const events = await this.parseICalFeed(feed.feed_url)
      console.log('[CalendarSync] Parsed events:', events.length)
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

      console.log('[CalendarSync] Sync job completed successfully:', result)
      return {
        success: result.success,
        eventsProcessed: events.length,
        conflicts: result.conflicts,
        lastSync: now
      }
    } catch (error) {
      console.error('[CalendarSync] Failed to process sync job:', error)
      throw error
    }
  }

  async parseICalFeed(feedUrl: string): Promise<CalendarEvent[]> {
    console.log('[CalendarSync] Starting to parse iCal feed from URL:', feedUrl)
    try {
      // Use our proxy API route instead of direct fetch
      const proxyUrl = `/api/calendar/proxy?url=${encodeURIComponent(feedUrl)}`
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        console.error('[CalendarSync] Failed to fetch feed:', response.status, response.statusText)
        throw new Error(`Failed to fetch iCal feed: ${response.statusText}`)
      }

      const icalData = await response.text()
      console.log('[CalendarSync] Received iCal data, length:', icalData.length)
      
      const events = parseICalendarData(icalData)
      console.log('[CalendarSync] Parsed events:', events.length)

      return events
    } catch (err) {
      console.error('[CalendarSync] Error parsing iCal feed:', err)
      throw new Error('Failed to parse iCal feed')
    }
  }
}

export const calendarSyncService = new CalendarSyncService()
