import { CalendarEvent, SyncResult } from '@/types/calendar'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'

export type ConflictResolution = 'keep_airbnb' | 'keep_local' | 'manual'

export interface AirbnbSyncConfig {
  propertyId: string
  importUrl: string
  exportUrl: string
  conflictResolution: ConflictResolution
}

export interface CalendarConflict {
  airbnbEvent: CalendarEvent
  localEvent: CalendarEvent
  resolution?: ConflictResolution
}

export class AirbnbSyncService {
  private supabase = createClientComponentClient<Database>()

  /**
   * Exports local calendar events to Airbnb
   */
  async exportToAirbnb(config: AirbnbSyncConfig): Promise<SyncResult> {
    try {
      // Get local events for the property
      const { data: localEvents } = await this.supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', config.propertyId)

      if (!localEvents) {
        throw new Error('No local events found')
      }

      // Convert to iCal format
      const icalData = this.generateICalFeed(localEvents)

      // Send to Airbnb export URL
      const response = await fetch('/api/calendar/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: config.exportUrl,
          icalData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to export calendar to Airbnb')
      }

      return {
        success: true,
        eventsProcessed: localEvents.length,
        lastSync: new Date(),
      }
    } catch (error) {
      console.error('[AirbnbSync] Export error:', error)
      return {
        success: false,
        eventsProcessed: 0,
        lastSync: new Date(),
        warnings: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Imports events from Airbnb and handles conflicts
   */
  async importFromAirbnb(config: AirbnbSyncConfig): Promise<SyncResult> {
    try {
      // Fetch Airbnb calendar
      const response = await fetch(`/api/calendar/proxy?url=${encodeURIComponent(config.importUrl)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch Airbnb calendar')
      }

      const icalData = await response.text()
      const airbnbEvents = await this.parseICalFeed(icalData)

      // Get local events
      const { data: localEvents } = await this.supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', config.propertyId)

      // Find conflicts
      const conflicts = this.findConflicts(airbnbEvents, localEvents || [])

      // Handle conflicts based on configuration
      const resolvedEvents = await this.resolveConflicts(
        conflicts,
        airbnbEvents,
        localEvents || [],
        config.conflictResolution
      )

      // Update local calendar
      await this.updateLocalCalendar(config.propertyId, resolvedEvents)

      return {
        success: true,
        eventsProcessed: resolvedEvents.length,
        conflicts: conflicts.length > 0 ? conflicts.map(c => c.airbnbEvent) : undefined,
        lastSync: new Date(),
      }
    } catch (error) {
      console.error('[AirbnbSync] Import error:', error)
      return {
        success: false,
        eventsProcessed: 0,
        lastSync: new Date(),
        warnings: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Find conflicts between Airbnb and local events
   */
  private findConflicts(
    airbnbEvents: CalendarEvent[],
    localEvents: Database['public']['Tables']['property_availability']['Row'][]
  ): CalendarConflict[] {
    const conflicts: CalendarConflict[] = []

    for (const airbnbEvent of airbnbEvents) {
      for (const localEvent of localEvents) {
        if (this.eventsOverlap(airbnbEvent, {
          start: new Date(localEvent.start_date),
          end: new Date(localEvent.end_date),
        })) {
          conflicts.push({
            airbnbEvent,
            localEvent: {
              start: new Date(localEvent.start_date),
              end: new Date(localEvent.end_date),
              summary: localEvent.description || '',
              uid: localEvent.external_id || '',
              status: localEvent.status as any,
            },
          })
        }
      }
    }

    return conflicts
  }

  /**
   * Check if two events overlap in time
   */
  private eventsOverlap(event1: Pick<CalendarEvent, 'start' | 'end'>, event2: Pick<CalendarEvent, 'start' | 'end'>): boolean {
    return event1.start < event2.end && event2.start < event1.end
  }

  /**
   * Resolve conflicts based on configuration
   */
  private async resolveConflicts(
    conflicts: CalendarConflict[],
    airbnbEvents: CalendarEvent[],
    localEvents: Database['public']['Tables']['property_availability']['Row'][],
    resolution: ConflictResolution
  ): Promise<CalendarEvent[]> {
    const resolvedEvents: CalendarEvent[] = []

    // Add non-conflicting events
    const nonConflictingAirbnb = airbnbEvents.filter(
      ae => !conflicts.some(c => c.airbnbEvent.uid === ae.uid)
    )
    const nonConflictingLocal = localEvents.filter(
      le => !conflicts.some(c => c.localEvent.uid === le.external_id)
    ).map(le => ({
      start: new Date(le.start_date),
      end: new Date(le.end_date),
      summary: le.description || '',
      uid: le.external_id || '',
      status: le.status as any,
    }))

    resolvedEvents.push(...nonConflictingAirbnb, ...nonConflictingLocal)

    // Handle conflicts based on resolution strategy
    for (const conflict of conflicts) {
      switch (resolution) {
        case 'keep_airbnb':
          resolvedEvents.push(conflict.airbnbEvent)
          break
        case 'keep_local':
          resolvedEvents.push(conflict.localEvent)
          break
        case 'manual':
          // For manual resolution, we'll keep both events marked as conflicts
          // The UI will handle showing these to the user for manual resolution
          resolvedEvents.push({
            ...conflict.airbnbEvent,
            status: 'conflict',
          })
          resolvedEvents.push({
            ...conflict.localEvent,
            status: 'conflict',
          })
          break
      }
    }

    return resolvedEvents
  }

  /**
   * Update the local calendar with resolved events
   */
  private async updateLocalCalendar(propertyId: string, events: CalendarEvent[]) {
    // First, delete existing events
    await this.supabase
      .from('property_availability')
      .delete()
      .eq('property_id', propertyId)

    // Then insert new events
    await this.supabase
      .from('property_availability')
      .insert(
        events.map(event => ({
          property_id: propertyId,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          description: event.summary,
          status: event.status,
          external_id: event.uid,
        }))
      )
  }

  /**
   * Generate iCal feed from local events
   */
  private generateICalFeed(events: Database['public']['Tables']['property_availability']['Row'][]): string {
    const icalLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cluster Estate//Calendar Sync//EN',
    ]

    for (const event of events) {
      icalLines.push(
        'BEGIN:VEVENT',
        `UID:${event.external_id || crypto.randomUUID()}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}Z`,
        `DTSTART:${new Date(event.start_date).toISOString().replace(/[-:.]/g, '')}Z`,
        `DTEND:${new Date(event.end_date).toISOString().replace(/[-:.]/g, '')}Z`,
        `SUMMARY:${event.description || 'Unavailable'}`,
        `STATUS:${event.status || 'CONFIRMED'}`,
        'END:VEVENT'
      )
    }

    icalLines.push('END:VCALENDAR')
    return icalLines.join('\r\n')
  }

  /**
   * Parse iCal feed into calendar events
   */
  private async parseICalFeed(icalData: string): Promise<CalendarEvent[]> {
    const { parseICalendarData } = await import('@/lib/calendar')
    return parseICalendarData(icalData)
  }
}

export const airbnbSyncService = new AirbnbSyncService()
