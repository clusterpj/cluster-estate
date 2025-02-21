import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'
import { CalendarEvent, SyncResult } from '@/types/calendar'
import { parseICalendarData } from '@/lib/calendar'

interface CalendarFeed {
  id: string;
  property_id: string;
  feed_url: string;
  feed_type: 'import' | 'export';
  sync_frequency: number;
  sync_enabled: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_result: any;
  created_at: string;
  priority: number;
}

interface PropertyAvailability {
  id: string;
  property_id: string;
  external_id: string;
  start_date: string;
  end_date: string;
  status: 'available' | 'unavailable';
  source: 'calendar_sync' | 'manual';
  feed_id: string;
  feed_priority: number;
}

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

  private async findConflictingEvents(propertyId: string, startDate: string, endDate: string): Promise<PropertyAvailability[]> {
    console.log('[CalendarSync] Checking for conflicting events:', { propertyId, startDate, endDate });
    
    const { data: conflicts, error } = await this.supabase
      .from('property_availability')
      .select('*')
      .eq('property_id', propertyId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) {
      console.error('[CalendarSync] Error checking conflicts:', error);
      return [];
    }

    return conflicts || [];
  }

  private async handleEventConflicts(
    event: CalendarEvent,
    feed: CalendarFeed,
    conflicts: PropertyAvailability[]
  ): Promise<boolean> {
    console.log('[CalendarSync] Handling conflicts for event:', {
      eventId: event.uid,
      feedPriority: feed.priority,
      conflicts: conflicts.length
    });

    // If no conflicts or current feed has higher priority, proceed with update
    const canOverride = conflicts.every(conflict => 
      !conflict.feed_priority || feed.priority >= conflict.feed_priority
    );

    if (canOverride) {
      // Delete conflicting events with lower or equal priority
      if (conflicts.length > 0) {
        console.log('[CalendarSync] Overriding conflicting events with lower priority');
        const { error: deleteError } = await this.supabase
          .from('property_availability')
          .delete()
          .in('id', conflicts.map(c => c.id));

        if (deleteError) {
          console.error('[CalendarSync] Error deleting conflicts:', deleteError);
          return false;
        }
      }
      return true;
    }

    console.log('[CalendarSync] Cannot override - lower priority');
    return false;
  }

  public async syncCalendarFeed(feedId: string, propertyId: string): Promise<SyncResult> {
    console.log('[CalendarSync] Starting sync for feed:', feedId, 'property:', propertyId);
    
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      lastSync: new Date(),
      warnings: []
    };

    try {
      // Get feed details including priority
      const { data: feed, error: feedError } = await this.supabase
        .from('calendar_feeds')
        .select('*')
        .eq('id', feedId)
        .eq('property_id', propertyId)
        .single();

      if (feedError) {
        console.error('[CalendarSync] Error fetching feed:', feedError);
        throw new Error(`Failed to fetch feed: ${feedError.message}`);
      }

      if (!feed) {
        console.error('[CalendarSync] Feed not found:', { feedId, propertyId });
        throw new Error('Feed not found');
      }

      console.log('[CalendarSync] Found feed to sync:', feed);

      // Fetch and parse events
      const response = await fetch(feed.feed_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
      }

      const icalData = await response.text();
      console.log('[CalendarSync] Received iCal data:', icalData);

      const events = parseICalendarData(icalData);
      console.log('[CalendarSync] Parsed events details:', events);

      // Process each event
      for (const event of events) {
        try {
          // Check for existing event by external_id
          const { data: existingEvents, error: queryError } = await this.supabase
            .from('property_availability')
            .select('*')
            .eq('property_id', propertyId)
            .eq('external_id', event.uid);

          if (queryError) {
            console.error('[CalendarSync] Error querying existing event:', queryError);
            result.warnings.push(`Failed to query event ${event.uid}: ${queryError.message}`);
            continue;
          }

          // Find any conflicting events in the date range
          const conflicts = await this.findConflictingEvents(
            propertyId,
            event.start,
            event.end
          );

          // Handle conflicts based on priority
          const canProceed = await this.handleEventConflicts(event, feed, conflicts);

          if (!canProceed) {
            result.warnings.push(`Skipped event ${event.uid} due to higher priority conflict`);
            continue;
          }

          // Map status
          let status: 'available' | 'unavailable' = 'unavailable';
          switch (event.status?.toLowerCase()) {
            case 'canceled':
            case 'cancelled':
              status = 'available';
              break;
            default:
              status = 'unavailable';
          }

          // Insert or update event
          const eventData = {
            property_id: propertyId,
            external_id: event.uid,
            start_date: event.start,
            end_date: event.end,
            status,
            source: 'calendar_sync' as const,
            feed_id: feed.id,
            feed_priority: feed.priority
          };

          if (!existingEvents || existingEvents.length === 0) {
            const { error: insertError } = await this.supabase
              .from('property_availability')
              .insert(eventData);

            if (insertError) {
              console.error('[CalendarSync] Error inserting event:', insertError);
              result.warnings.push(`Failed to insert event ${event.uid}: ${insertError.message}`);
            } else {
              console.log('[CalendarSync] Successfully inserted event:', event.uid);
              result.eventsProcessed++;
            }
          } else {
            const { error: updateError } = await this.supabase
              .from('property_availability')
              .update(eventData)
              .eq('external_id', event.uid)
              .eq('property_id', propertyId);

            if (updateError) {
              console.error('[CalendarSync] Error updating event:', updateError);
              result.warnings.push(`Failed to update event ${event.uid}: ${updateError.message}`);
            } else {
              console.log('[CalendarSync] Successfully updated event:', event.uid);
              result.eventsProcessed++;
            }
          }
        } catch (eventError) {
          console.error('[CalendarSync] Error processing event:', eventError);
          result.warnings.push(`Failed to process event ${event.uid}: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`);
        }
      }

      // Update feed sync status
      await this.updateFeedSyncStatus(feed.id, propertyId, result);

    } catch (error) {
      console.error('[CalendarSync] Error during sync:', error);
      result.success = false;
      result.warnings.push(error instanceof Error ? error.message : 'Unknown error during sync');
      throw error; // Re-throw to handle in the component
    }

    return result;
  }

  private async updateFeedSyncStatus(feedId: string, propertyId: string, result: SyncResult) {
    await this.updateCalendarFeed(propertyId, feedId, {
      last_sync_at: result.lastSync.toISOString(),
      last_sync_status: result.success ? 'success' : 'error',
      last_sync_result: result
    });
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
          start_date: event.start,
          end_date: event.end,
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
      console.log('[CalendarSync] Received iCal data:', icalData)
      
      const events = parseICalendarData(icalData)
      console.log('[CalendarSync] Parsed events details:', events)

      return events
    } catch (err) {
      console.error('[CalendarSync] Error parsing iCal feed:', err)
      throw new Error('Failed to parse iCal feed')
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
}

export const calendarSyncService = new CalendarSyncService()
