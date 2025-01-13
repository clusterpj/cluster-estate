export interface Calendar {
  id: string
  property_id: string
  name: string
  type: 'internal' | 'ical'
  ical_url?: string
  sync_token?: string
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  calendar_id: string
  event_id: string
  summary?: string
  description?: string
  start: string
  end_time: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  attendees?: Record<string, any>[]
  created_at: string
  updated_at: string
}

export type CalendarSyncStatus = 'pending' | 'synced' | 'failed'
