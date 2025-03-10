'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase-client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ReloadIcon } from '@radix-ui/react-icons'

export default function AdvancedAuthDebugger() {
  // Direct Supabase client for verification
  const supabase = createClientComponentClient()
  
  // States
  const [authState, setAuthState] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [directSession, setDirectSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fixAttempted, setFixAttempted] = useState(false)
  const [fixResult, setFixResult] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      setError(null)
      
      try {
        // Get current session directly from Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`)
        }
        
        setDirectSession(sessionData.session)
        
        if (!sessionData.session) {
          setLoading(false)
          return
        }
        
        // Get user info
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw new Error(`User data error: ${userError.message}`)
        }
        
        setAuthState({
          user: userData.user,
          session: sessionData.session
        })
        
        // Get profile data directly with detailed error handling
        if (userData.user) {
          try {
            console.log('Fetching profile data for:', userData.user.id)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userData.user.id)
              .single()
            
            if (profileError) {
              if (profileError.code === 'PGRST116') {
                console.log('No profile found for user')
                setProfileData({ error: 'No profile found in database' })
              } else {
                throw new Error(`Profile error: ${profileError.message}`)
              }
            } else {
              console.log('Profile data retrieved:', profile)
              setProfileData(profile)
            }
          } catch (profileFetchError) {
            console.error('Error in profile fetch:', profileFetchError)
            setProfileData({ error: String(profileFetchError) })
          }
        }
      } catch (e) {
        console.error('Auth check error:', e)
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [supabase])
  
  const fixAdminRole = async () => {
    if (!authState?.user?.id) return
    
    try {
      setFixAttempted(true)
      setFixResult('Attempting to update role...')
      
      // First try to fix using direct method
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authState.user.id)
      
      if (updateError) {
        throw new Error(`Database update error: ${updateError.message}`)
      }
      
      setFixResult('Role updated to admin successfully. Please refresh the page.')
      
      // Re-fetch profile data to confirm
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .single()
      
      setProfileData(updatedProfile)
      
    } catch (error) {
      console.error('Error fixing admin role:', error)
      setFixResult(`Error: ${String(error)}`)
    }
  }
  
  const refreshAuth = () => {
    window.location.reload()
  }
  
  const createProfileIfMissing = async () => {
    if (!authState?.user?.id) return
    
    try {
      setFixAttempted(true)
      setFixResult('Attempting to create profile...')
      
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authState.user.id)
        .single()
      
      if (!checkError && existingProfile) {
        setFixResult('Profile already exists, updating role to admin...')
        
        // Update role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin'
          })
          .eq('id', authState.user.id)
        
        if (updateError) {
          throw new Error(`Profile update error: ${updateError.message}`)
        }
      } else {
        // Create new profile
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authState.user.id,
            email: authState.user.email,
            full_name: authState.user.email.split('@')[0],
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createError) {
          throw new Error(`Profile creation error: ${createError.message}`)
        }
      }
      
      setFixResult('Profile created/updated with admin role. Please refresh the page.')
      
      // Re-fetch profile data to confirm
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .single()
      
      setProfileData(updatedProfile)
      
    } catch (error) {
      console.error('Error creating/updating profile:', error)
      setFixResult(`Error: ${String(error)}`)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Debugging Tool</CardTitle>
          <CardDescription>Loading auth data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <ReloadIcon className="h-10 w-10 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Debugging Tool</CardTitle>
          <CardDescription className="text-red-500">Error loading auth data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={refreshAuth}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!directSession) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Debugging Tool</CardTitle>
          <CardDescription>You must be logged in to use this tool</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please log in and then return to this page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Advanced Auth Debugging Tool</CardTitle>
        <CardDescription>
          Diagnose and fix authentication and role issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Status Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Authentication Status</h2>
          {authState?.user ? (
            <>
              <p><strong>User ID:</strong> {authState.user.id}</p>
              <p><strong>Email:</strong> {authState.user.email}</p>
              <p>
                <strong>Session Status:</strong>{' '}
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </p>
            </>
          ) : (
            <Alert>
              <AlertTitle>Auth Inconsistency</AlertTitle>
              <AlertDescription>
                Session exists but user data could not be retrieved. This indicates a potential auth issue.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Separator />
        
        {/* Profile Data Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Profile Data</h2>
          
          {profileData ? (
            profileData.error ? (
              <Alert variant="destructive">
                <AlertTitle>Profile Error</AlertTitle>
                <AlertDescription>{profileData.error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <p>
                  <strong>Role:</strong>{' '}
                  <Badge variant={profileData.role === 'admin' ? 'default' : 'outline'}>
                    {profileData.role || 'Not set'}
                  </Badge>
                </p>
                <p><strong>Full Name:</strong> {profileData.full_name || 'Not set'}</p>
                <p><strong>Profile ID:</strong> {profileData.id}</p>
              </>
            )
          ) : (
            <p>No profile data available</p>
          )}
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button onClick={refreshAuth}>
            Refresh Auth State
          </Button>
          
          <Button 
            onClick={fixAdminRole} 
            variant="secondary" 
            disabled={!authState?.user}
          >
            Fix Admin Role
          </Button>
          
          {(!profileData || profileData.error) && (
            <Button 
              onClick={createProfileIfMissing}
              variant="outline"
              disabled={!authState?.user}
            >
              Create/Fix Profile
            </Button>
          )}
        </div>
        
        {fixAttempted && fixResult && (
          <Alert className={fixResult.includes('Error') ? 'bg-red-50' : 'bg-green-50'}>
            <AlertTitle>{fixResult.includes('Error') ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{fixResult}</AlertDescription>
          </Alert>
        )}
        
        {/* Debug Information */}
        <Separator className="my-4" />
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Raw Debug Information</h2>
          
          <details className="text-sm">
            <summary className="cursor-pointer p-2 bg-slate-100 dark:bg-slate-800 rounded-md mb-2">
              Session & Auth State
            </summary>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </details>
          
          <details className="text-sm">
            <summary className="cursor-pointer p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
              Profile Data
            </summary>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}