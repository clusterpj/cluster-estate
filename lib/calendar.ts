import ICAL from 'ical.js'
import { CalendarEvent } from '@/types/calendar'

/**
 * Parses an iCalendar string and returns an array of calendar events
 * @param icalData - The iCalendar data as a string
 * @returns An array of CalendarEvent objects
 */
export function parseICalendarData(icalData: string): CalendarEvent[] {
  try {
    console.log('[Calendar] Parsing iCal data:', icalData)
    const jcalData = ICAL.parse(icalData)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')
    console.log('[Calendar] Found vevents:', vevents.length)

    return vevents.map(vevent => {
      console.log('[Calendar] Processing event:', {
        uid: vevent.getFirstPropertyValue('uid'),
        summary: vevent.getFirstPropertyValue('summary'),
        start: vevent.getFirstPropertyValue('dtstart'),
        end: vevent.getFirstPropertyValue('dtend')
      })

      const event = new ICAL.Event(vevent)
      
      // Convert ICAL.Time to JavaScript Date then to ISO string
      const startDate = event.startDate.toJSDate();
      const endDate = event.endDate.toJSDate();
      
      const rawStatus = vevent.getFirstPropertyValue('status')
      console.log('[Calendar] Raw event status:', rawStatus)

      const status = normalizeEventStatus(rawStatus)
      console.log('[Calendar] Final normalized status:', status)

      const calEvent: CalendarEvent = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        summary: vevent.getFirstPropertyValue('summary'),
        uid: vevent.getFirstPropertyValue('uid'),
        status,
        description: vevent.getFirstPropertyValue('description'),
        location: vevent.getFirstPropertyValue('location'),
        organizer: vevent.getFirstPropertyValue('organizer'),
        attendees: vevent.getAllProperties('attendee').map(a => a.getFirstValue()),
        sequence: vevent.getFirstPropertyValue('sequence') || 0
      }

      console.log('[Calendar] Parsed event:', calEvent)
      return calEvent
    })
  } catch (error) {
    console.error('Error parsing iCalendar data:', error)
    throw new Error('Failed to parse iCalendar data')
  }
}

/**
 * Normalize event status from iCal to our system
 * @param status - The event status from the iCalendar data
 * @returns A normalized status string
 */
function normalizeEventStatus(status: string | null): 'available' | 'unavailable' {
  console.log('[Calendar] Normalizing event status:', status);
  if (!status) {
    console.log('[Calendar] No status provided, defaulting to unavailable');
    return 'unavailable';
  }
  
  const normalizedStatus = status.toLowerCase();
  console.log('[Calendar] Normalized status:', normalizedStatus);
  
  switch (normalizedStatus) {
    case 'cancelled':
    case 'canceled':
      return 'available';
    case 'confirmed':
    case 'tentative':
    case 'booked':
    default:
      return 'unavailable';
  }
}
