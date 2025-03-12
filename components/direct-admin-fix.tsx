'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'

// Define types for better type safety
interface DebugInfo {
  session?: {
    id: string;
    email: string | undefined;
    expires_at: string;
    last_sign_in_at?: string;
  };
  profile?: {
    id: string;
    role: string;
    full_name: string;
    created_at?: string;
    updated_at?: string;
  };
  profileError?: string;
  result?: {
    action: string;
    profile: any;
  };
  fixError?: string;
  authProviderProfile?: any;
}

export default function DirectAdminFix() {
  const { user, userProfile, refreshProfile, refreshSession } = useAuth()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Getting user...')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true)
        const supabase = createClientComponentClient()
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (!session) {
          setStatus('No active session. Please log in.')
          return
        }
        
        // Store debug info about session
        setDebugInfo({
          session: {
            id: session.user.id,
            email: session.user.email,
            expires_at: new Date((session.expires_at || 0) * 1000).toLocaleString(),
            last_sign_in_at: session.user.last_sign_in_at 
              ? new Date(session.user.last_sign_in_at).toLocaleString() 
              : undefined
          },
          authProviderProfile: userProfile || null
        })
        
        // Check if profile exists directly in the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (!profileError && profile) {
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev || {},
            profile: {
              id: profile.id,
              role: profile.role,
              full_name: profile.full_name,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            }
          }))
        } else {
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev || {},
            profileError: profileError ? profileError.message : 'No profile found'
          }))
        }
        
        setUserId(session.user.id)
        setStatus('Ready to fix admin role')
      } catch (err) {
        console.error('Error initializing component:', err)
        setError(String(err))
        setStatus('Error initializing')
      } finally {
        setLoading(false)
      }
    }
    
    initializeComponent()
  }, [userProfile])
  
  const fixAdminRole = async () => {
    if (!userId) {
      setError('No user ID available')
      return
    }
    
    setStatus('Fixing...')
    setError(null)
    setLoading(true)
    
    try {
      const supabase = createClientComponentClient()
      
      // First try to update existing profile
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, role, email, full_name')
        .eq('id', userId)
        .single()
      
      let result
      
      if (!checkError && existingProfile) {
        // Profile exists, update it
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()
        
        if (updateError) throw updateError
        result = { action: 'updated', profile: updatedProfile }
      } else {
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error('Could not get user info')
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email || 'unknown@example.com',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (insertError) throw insertError
        result = { action: 'created', profile: newProfile }
      }
      
      // Store the result in debug info
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev || {},
        result
      }))
      
      // Refresh the profile in the auth provider
      await refreshProfile()
      
      // Also refresh the session to ensure all auth data is up to date
      await refreshSession()
      
      setStatus('Admin role set successfully!')
      setSuccess(true)
    } catch (err) {
      console.error('Error fixing role:', err)
      setError(String(err))
      setStatus('Failed to fix role')
      
      // Add error to debug info
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev || {},
        fixError: String(err)
      }))
    } finally {
      setLoading(false)
    }
  }
  
  const forceSignOut = async () => {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()
      await supabase.auth.signOut({ scope: 'global' })
      
      // Redirect to login page
      window.location.href = '/auth/login'
    } catch (err) {
      setError(`Error signing out: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }
  
  const refreshPage = () => {
    window.location.reload()
  }
  
  const refreshAuthData = async () => {
    try {
      setLoading(true)
      setStatus('Refreshing auth data...')
      
      // Refresh both session and profile
      await refreshSession()
      const updatedProfile = await refreshProfile()
      
      // Update debug info with the refreshed profile
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev || {},
        authProviderProfile: updatedProfile
      }))
      
      // Also refresh the page to ensure all components get the updated data
      router.refresh()
      
      setStatus('Auth data refreshed')
    } catch (err) {
      console.error('Error refreshing auth data:', err)
      setError(`Error refreshing: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-medium">Direct Admin Role Fix</h3>
        <p className="text-sm text-muted-foreground">
          This tool bypasses the auth provider and directly updates your profile in the database
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Loading...</p>
            </div>
          ) : userId ? (
            <div className="space-y-2">
              <p><span className="font-medium">User ID:</span> {userId}</p>
              <p><span className="font-medium">Status:</span> {status}</p>
              <p><span className="font-medium">Current Role:</span> {debugInfo?.profile?.role || userProfile?.role || 'unknown'}</p>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Not Logged In</AlertTitle>
              <AlertDescription>
                Status: {status}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 mt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                <p>Admin role has been {debugInfo?.result?.action || 'set'} successfully!</p>
                <p className="mt-1">Please sign out and sign back in, then try accessing the admin dashboard.</p>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Session Status Information */}
          {user && (
            <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Session Information</AlertTitle>
              <AlertDescription>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Auth Provider Profile:</span> {userProfile ? 'Loaded' : 'Not Loaded'}</p>
                {userProfile && (
                  <p><span className="font-medium">Auth Provider Role:</span> {userProfile.role}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="mt-4 border border-gray-200 rounded-md p-3">
              <p className="font-medium mb-2">Debug Information:</p>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={fixAdminRole} 
            disabled={!userId || loading || success}
            className={success ? 'bg-green-500' : ''}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : success ? (
              'Role Fixed ✓'
            ) : (
              'Fix Admin Role Directly'
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={refreshAuthData}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Auth Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={refreshPage}
            disabled={loading}
          >
            Refresh Page
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={forceSignOut}
            disabled={loading}
          >
            Force Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}