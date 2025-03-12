// app/api/admin-fix/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
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
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ 
        error: `Error checking profile: ${profileError.message}`,
        status: 500
      })
    }
    
    let result
    
    // If profile exists, update it to have admin role
    if (existingProfile) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select()
        .single()
      
      if (updateError) {
        return NextResponse.json({ 
          error: `Error updating profile: ${updateError.message}`,
          status: 500
        })
      }
      
      result = {
        action: 'updated',
        profile: updatedProfile
      }
    } else {
      // Create new profile with admin role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.email?.split('@')[0] || 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        return NextResponse.json({ 
          error: `Error creating profile: ${createError.message}`,
          status: 500
        })
      }
      
      result = {
        action: 'created',
        profile: newProfile
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin role granted successfully',
      result
    })
  } catch (error) {
    console.error('Error in admin-fix:', error)
    return NextResponse.json({ 
      error: String(error),
      status: 500
    })
  }
}
