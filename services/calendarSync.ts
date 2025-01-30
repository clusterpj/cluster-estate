import axios from 'axios'

const API_BASE = '/api/calendar-sync'

export type CalendarFeed = {
  id: string
  feed_url: string
  feed_type: "import" | "export"
  sync_frequency: number
  sync_enabled: boolean
  last_sync_at?: string
  last_sync_status?: 'success' | 'error'
  last_sync_result?: {
    eventsProcessed: number
    conflicts?: number
    warnings?: string[]
  }
}

export const createCalendarFeed = async (propertyId: string, feed: Omit<CalendarFeed, 'id'>) => {
  const response = await axios.post(`${API_BASE}/${propertyId}/feeds`, feed)
  return response.data
}

export const updateCalendarFeed = async (propertyId: string, feedId: string, updates: Partial<CalendarFeed>) => {
  const response = await axios.patch(`${API_BASE}/${propertyId}/feeds/${feedId}`, updates)
  return response.data
}

export const deleteCalendarFeed = async (propertyId: string, feedId: string) => {
  await axios.delete(`${API_BASE}/${propertyId}/feeds/${feedId}`)
}

export const getCalendarFeeds = async (propertyId: string) => {
  const response = await axios.get(`${API_BASE}/${propertyId}/feeds`)
  return response.data
}
