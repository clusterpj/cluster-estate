// app/api/admin-check/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        status: 401
      })
    }
    
    // Get profile directly with minimal query
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()
    
    // Check middleware access
    const hasAdminAccess = profile?.role === 'admin'
    
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      profileFound: !!profile,
      role: profile?.role || 'unknown',
      isAdmin: hasAdminAccess
    })
  } catch (error) {
    console.error('Error in admin-check:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}