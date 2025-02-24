import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const { data: userRole } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get request body
    const { bookingId, status } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid payment status' },
        { status: 400 }
      )
    }

    // Update booking payment status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_status: status })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json(
        { message: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Payment status updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in update-payment-status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
