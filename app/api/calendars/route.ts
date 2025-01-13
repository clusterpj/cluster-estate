import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Calendar, CalendarEvent } from '@/types/calendar'
import { CalendarSyncService } from '@/lib/calendar-sync'
import { z } from 'zod'

// Schema for calendar creation
const calendarSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['internal', 'ical']),
  ical_url: z.string().url().optional(),
  sync_frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = calendarSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      )
    }

    const { data: calendar, error } = await supabase
      .from('calendars')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    // If it's an iCal calendar, trigger initial sync
    if (validation.data.type === 'ical' && validation.data.ical_url) {
      const calendarSync = new CalendarSyncService()
      await calendarSync.syncCalendar(calendar.id)
    }

    return NextResponse.json(calendar)
  } catch (error) {
    console.error('Error creating calendar:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('property_id')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const { data: calendars, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(calendars)
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    )
  }
}
