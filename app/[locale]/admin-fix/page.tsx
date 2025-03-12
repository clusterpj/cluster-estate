'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

export default function AdminFixPage() {
  const { user, userProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [directProfileCheck, setDirectProfileCheck] = useState<any>(null)
  const router = useRouter()
  const t = useTranslations()
  const supabase = createClientComponentClient()
  
  // Fetch session info on load
  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error fetching session:', error)
          setError(`Session error: ${error.message}`)
          return
        }
        
        setSessionInfo(data)
        
        // If we have a session, also check profile directly
        if (data.session) {
          checkProfileDirectly(data.session.user.id)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError(`Unexpected error: ${String(err)}`)
      }
    }
    
    fetchSessionInfo()
  }, [])
  
  // Direct profile check bypassing the auth provider
  const checkProfileDirectly = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.log('Direct profile check - no profile found:', error)
        setDirectProfileCheck({ found: false, error: error.message })
      } else {
        console.log('Direct profile check - profile found:', data)
        setDirectProfileCheck({ found: true, profile: data })
      }
    } catch (err) {
      console.error('Error in direct profile check:', err)
      setDirectProfileCheck({ found: false, error: String(err) })
    }
  }
  
  const fixAdminRole = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix admin role')
      }
      
      setResult(data)
      
      // Reload the page after a short delay to refresh auth state
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error('Error fixing admin role:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }
  
  const refreshPage = () => {
    window.location.reload()
  }
  
  const forceSignOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      window.location.href = `/${t('locale')}/auth/login`
    } catch (err) {
      console.error('Error signing out:', err)
      setError(`Error signing out: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Role Fix</CardTitle>
          <CardDescription>
            This tool will diagnose and fix issues with your admin role
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">User</h4>
                {user ? (
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">ID:</span> {user.id}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not logged in</p>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Profile from Auth Provider</h4>
                {userProfile ? (
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {userProfile.full_name}</p>
                    <p><span className="font-medium">Role:</span> <span className={userProfile.role === 'admin' ? 'text-green-600 font-bold' : ''}>{userProfile.role || 'none'}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No profile found in auth provider</p>
                )}
              </div>
            </div>
            
            {/* Direct Profile Check */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Direct Profile Check</h4>
              {directProfileCheck === null ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Checking profile directly...</p>
                </div>
              ) : directProfileCheck.found ? (
                <div className="text-sm space-y-1">
                  <p className="text-green-600 font-medium">Profile found directly in database</p>
                  <p><span className="font-medium">ID:</span> {directProfileCheck.profile.id}</p>
                  <p><span className="font-medium">Role:</span> <span className={directProfileCheck.profile.role === 'admin' ? 'text-green-600 font-bold' : ''}>{directProfileCheck.profile.role || 'none'}</span></p>
                </div>
              ) : (
                <div className="text-sm space-y-1">
                  <p className="text-red-600 font-medium">No profile found in direct database check</p>
                  <p><span className="font-medium">Error:</span> {directProfileCheck.error}</p>
                </div>
              )}
            </div>
            
            {/* Session Info */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Session</h4>
              {sessionInfo === null ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Loading session info...</p>
                </div>
              ) : sessionInfo.session ? (
                <div className="text-sm">
                  <p><span className="font-medium">Active:</span> Yes</p>
                  <p><span className="font-medium">User ID:</span> {sessionInfo.session.user.id}</p>
                  <p><span className="font-medium">Expires:</span> {new Date(sessionInfo.session.expires_at * 1000).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">No active session found</p>
              )}
            </div>
          </div>
          
          {/* Fix Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fix Options</h3>
            
            <Alert>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will update your user profile to have admin role. Only use this if you are authorized to have admin access.
              </AlertDescription>
            </Alert>
            
            {result && (
              <Alert>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  {result.message}
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Action:</span> {result.result.action}</p>
                    <p><span className="font-medium">New Role:</span> {result.result.profile.role}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshPage} disabled={loading}>
            Refresh Page
          </Button>
          
          <Button onClick={fixAdminRole} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              'Fix Admin Role'
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={forceSignOut} 
            disabled={loading}
          >
            Force Sign Out
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>After fixing your admin role, sign out completely</li>
              <li>Clear your browser cache and cookies</li>
              <li>Sign in again with your credentials</li>
              <li>Try accessing the admin dashboard from the user menu</li>
              <li>If issues persist, try the <a href="/admin-check" className="text-blue-600 hover:underline">Admin Check</a> page for diagnostics</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
