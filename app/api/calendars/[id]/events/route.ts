import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CalendarEvent } from '@/types/calendar'
import { z } from 'zod'

const eventSchema = z.object({
  summary: z.string().min(1),
  description: z.string().optional(),
  start: z.string().datetime(),
  end_time: z.string().datetime(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional()
  })).optional()
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    const validation = eventSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      )
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        ...validation.data,
        calendar_id: params.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('calendar_id', params.id)
      .order('start', { ascending: true })

    if (start && end) {
      query = query
        .gte('start', start)
        .lte('end_time', end)
    }

    const { data: events, error } = await query

    if (error) throw error

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
