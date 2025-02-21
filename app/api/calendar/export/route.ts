import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { url, icalData } = await request.json()

    if (!url || !icalData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Send calendar data to the export URL
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/calendar',
      },
      body: icalData,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to export calendar: ${response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Calendar Export] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export calendar data' },
      { status: 500 }
    )
  }
}
