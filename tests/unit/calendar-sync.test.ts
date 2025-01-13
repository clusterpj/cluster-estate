import { CalendarSyncService } from '@/lib/calendar-sync'
import { createClient } from '@/utils/supabase-client'
import { Calendar, CalendarEvent } from '@/types/calendar'
import ical from 'ical.js'
import { DateTime } from 'luxon'

jest.mock('@/utils/supabase-client')

describe('CalendarSyncService', () => {
  let service: CalendarSyncService
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    service = new CalendarSyncService()
  })

  describe('syncCalendar', () => {
    it('should successfully sync an iCal calendar', async () => {
      const mockCalendar: Calendar = {
        id: 'calendar-1',
        property_id: 'property-1',
        name: 'Test Calendar',
        type: 'ical',
        ical_url: 'https://example.com/calendar.ics',
        sync_token: null,
        last_sync: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockICalData = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
BEGIN:VEVENT
UID:event-1@example.com
DTSTART;TZID=America/New_York:20240115T090000
DTEND;TZID=America/New_York:20240115T100000
SUMMARY:Test Event
DESCRIPTION:Test Description
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
      `

      // Mock fetch response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockICalData),
      })

      // Mock Supabase responses
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ data: mockCalendar, error: null }),
        insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
        update: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }))

      const result = await service.syncCalendar('calendar-1')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Synced 1 events')
    })

    it('should handle fetch errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await service.syncCalendar('calendar-1')
      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to fetch iCal feed')
    })
  })

  describe('checkAvailability', () => {
    it('should return true when no conflicts exist', async () => {
      const mockCalendars = [
        {
          id: 'calendar-1',
          property_id: 'property-1',
          name: 'Test Calendar',
          type: 'ical',
        },
      ]

      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ data: mockCalendars, error: null }),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const start = new Date('2024-01-15T09:00:00Z')
      const end = new Date('2024-01-15T10:00:00Z')
      const result = await service.checkAvailability('property-1', start, end)

      expect(result).toBe(true)
    })
  })
})
