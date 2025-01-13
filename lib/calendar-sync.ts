import { createClient } from '@/utils/supabase-client'
import ical from 'ical.js'
import { DateTime } from 'luxon'
import { Calendar, CalendarEvent } from '@/types/calendar'
import { Booking } from '@/types/booking'

const TIMEZONE_DB = 'UTC' // Default timezone for database storage

export class CalendarSyncService {
  private supabase = createClient()

  async syncCalendar(calendarId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get calendar details
      const { data: calendar, error: calendarError } = await this.supabase
        .from('calendars')
        .select('*')
        .eq('id', calendarId)
        .single()

      if (calendarError || !calendar) {
        throw new Error('Calendar not found')
      }

      // Only sync iCal calendars
      if (calendar.type !== 'ical' || !calendar.ical_url) {
        return { success: false, message: 'Not an iCal calendar' }
      }

      // Fetch iCal feed
      const response = await fetch(calendar.ical_url)
      if (!response.ok) {
        throw new Error('Failed to fetch iCal feed')
      }

      const icalData = await response.text()
      const jcalData = ical.parse(icalData)
      const comp = new ical.Component(jcalData)

      // Process events
      const events = comp.getAllSubcomponents('vevent')
      const processedEvents: CalendarEvent[] = []

      for (const event of events) {
        const processedEvent = await this.processEvent(event, calendar)
        if (processedEvent) {
          processedEvents.push(processedEvent)
        }
      }

      // Update sync status
      await this.supabase
        .from('calendars')
        .update({
          last_sync: new Date().toISOString(),
          sync_token: comp.getFirstPropertyValue('x-wr-calname') || null
        })
        .eq('id', calendarId)

      return {
        success: true,
        message: `Synced ${processedEvents.length} events`
      }
    } catch (error) {
      console.error('Calendar sync error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  private async processEvent(event: any, calendar: Calendar): Promise<CalendarEvent | null> {
    const eventId = event.getFirstPropertyValue('uid')
    const summary = event.getFirstPropertyValue('summary')
    const description = event.getFirstPropertyValue('description')
    const start = event.getFirstPropertyValue('dtstart')
    const end = event.getFirstPropertyValue('dtend')
    const status = event.getFirstPropertyValue('status') || 'confirmed'
    const attendees = event.getFirstPropertyValue('attendee')

    // Convert to UTC for database storage
    const startDate = DateTime.fromJSDate(start.toJSDate(), { zone: start.timezone })
      .toUTC()
      .toISO()
    const endDate = DateTime.fromJSDate(end.toJSDate(), { zone: end.timezone })
      .toUTC()
      .toISO()

    if (!startDate || !endDate) {
      return null
    }

    // Check for existing event
    const { data: existingEvent } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('calendar_id', calendar.id)
      .eq('event_id', eventId)
      .single()

    const eventData = {
      calendar_id: calendar.id,
      event_id: eventId,
      summary,
      description,
      start: startDate,
      end_time: endDate,
      status,
      attendees: attendees ? JSON.stringify(attendees) : null
    }

    if (existingEvent) {
      // Update existing event
      const { error } = await this.supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', existingEvent.id)

      if (error) throw error
      return { ...existingEvent, ...eventData }
    } else {
      // Create new event
      const { data: newEvent, error } = await this.supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error
      return newEvent
    }
  }

  async checkAvailability(propertyId: string, start: Date, end: Date): Promise<boolean> {
    // Get all calendars for property
    const { data: calendars } = await this.supabase
      .from('calendars')
      .select('*')
      .eq('property_id', propertyId)

    if (!calendars) return true

    // Check for conflicts in each calendar
    for (const calendar of calendars) {
      const { data: events } = await this.supabase
        .from('calendar_events')
        .select('*')
        .eq('calendar_id', calendar.id)
        .or(`and(start.lte.${end.toISOString()},end_time.gte.${start.toISOString()})`)
        .neq('status', 'cancelled')

      if (events && events.length > 0) {
        return false
      }
    }

    return true
  }

  async handleBookingStatusChange(bookingId: string, newStatus: string): Promise<void> {
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (!booking) return

    // If booking has a linked calendar event, update it
    if (booking.calendar_event_id) {
      await this.supabase
        .from('calendar_events')
        .update({ status: this.mapBookingStatusToEventStatus(newStatus) })
        .eq('id', booking.calendar_event_id)
    }
  }

  private mapBookingStatusToEventStatus(bookingStatus: string): string {
    switch (bookingStatus) {
      case 'confirmed':
        return 'confirmed'
      case 'cancelled':
        return 'cancelled'
      case 'pending':
      default:
        return 'tentative'
    }
  }
}
