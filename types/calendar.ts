/**
 * Represents a calendar event from an iCalendar feed
 */
export interface CalendarEvent {
  /** Start date and time of the event */
  start: Date
  /** End date and time of the event */
  end: Date
  /** Event summary or title */
  summary: string
  /** Unique identifier for the event */
  uid: string
  /** Event status */
  status: 'confirmed' | 'tentative' | 'canceled'
  /** Optional event description */
  description?: string
  /** Optional event location */
  location?: string
  /** Optional event organizer */
  organizer?: string
  /** Optional list of event attendees */
  attendees?: string[]
  /** Optional sequence number for recurring events */
  sequence?: number
}

/**
 * Result of a calendar sync operation
 */
export interface SyncResult {
  /** Whether the sync was successful */
  success: boolean
  /** Number of events processed */
  eventsProcessed: number
  /** Optional list of conflicting events */
  conflicts?: CalendarEvent[]
  /** Optional warning messages */
  warnings?: string[]
  /** When the sync was performed */
  lastSync?: Date
}
