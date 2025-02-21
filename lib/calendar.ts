import ICAL from 'ical.js'
import { CalendarEvent } from '@/types/calendar'

/**
 * Parses an iCalendar string and returns an array of calendar events
 * @param icalData - The iCalendar data as a string
 * @returns An array of CalendarEvent objects
 */
export function parseICalendarData(icalData: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icalData)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')

    return vevents.map(vevent => {
      const event = new ICAL.Event(vevent)
      const startDate = event.startDate.toJSDate()
      const endDate = event.endDate?.toJSDate() || new Date(startDate.getTime() + (event.duration?.toSeconds() || 0) * 1000)

      return {
        start: startDate,
        end: endDate,
        summary: event.summary || '',
        uid: event.uid || crypto.randomUUID(),
        status: normalizeEventStatus(event.status),
        description: event.description || undefined,
        location: event.location || undefined,
        organizer: event.organizer || undefined,
        attendees: event.attendees?.map(attendee => attendee.toString()) || undefined,
        sequence: event.sequence || 0
      }
    })
  } catch (error) {
    console.error('Error parsing iCalendar data:', error)
    throw new Error('Failed to parse iCalendar data')
  }
}

/**
 * Normalizes an event status to one of the supported values
 * @param status - The event status from the iCalendar data
 * @returns A normalized status string
 */
function normalizeEventStatus(status: string | null): 'confirmed' | 'tentative' | 'canceled' {
  if (!status) return 'confirmed'
  
  const normalizedStatus = status.toLowerCase()
  switch (normalizedStatus) {
    case 'confirmed':
    case 'tentative':
    case 'canceled':
      return normalizedStatus
    default:
      return 'confirmed'
  }
}
