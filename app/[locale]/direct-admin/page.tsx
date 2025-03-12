// app/[locale]/direct-admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DirectAdminFix from '@/components/direct-admin-fix'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

export default function DirectAdminPage() {
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const t = useTranslations()
  
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        const supabase = createClientComponentClient()
        
        // Get current user info
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error("Error getting user:", userError)
          setError(`User error: ${userError.message}`)
          return
        }
        
        if (user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          setUserInfo({
            id: user.id,
            email: user.email,
            profile: profileError ? null : profile
          })
        }
        
        // Get some basic admin data (property count, user count, etc.)
        const { data: propertyCount, error: propertyError } = await supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
        
        const { data: userCount, error: userError2 } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
        
        const { data: bookingCount, error: bookingError } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
        
        setAdminData({
          properties: propertyCount,
          users: userCount,
          bookings: bookingCount
        })
      } catch (err) {
        console.error("Error loading admin data:", err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    
    loadAdminData()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Direct Admin Dashboard</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            ) : userInfo ? (
              <div className="space-y-2">
                <p><span className="font-medium">User ID:</span> {userInfo.id}</p>
                <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                <p>
                  <span className="font-medium">Profile:</span> {' '}
                  {userInfo.profile ? (
                    <span className="text-green-600">Found</span>
                  ) : (
                    <span className="text-red-600">Not found</span>
                  )}
                </p>
                {userInfo.profile && (
                  <p>
                    <span className="font-medium">Role:</span> {' '}
                    <span className={userInfo.profile.role === 'admin' ? 'text-green-600 font-bold' : ''}>
                      {userInfo.profile.role || 'none'}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p>You're not logged in. Please sign in to access admin features.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="fix">Fix Admin Access</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshooting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{adminData?.properties?.count || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{adminData?.users?.count || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{adminData?.bookings?.count || 0}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Admin Actions</h2>
            
            <div className="space-y-2">
              <h3 className="font-medium">Manage Properties</h3>
              <div className="flex space-x-2">
                <Link 
                  href={`/${t('locale')}/admin/properties`} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Try Regular Admin Page
                </Link>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="fix">
          <DirectAdminFix />
        </TabsContent>
        
        <TabsContent value="troubleshoot">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Common Issues</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Profile not found:</strong> Your user account exists but doesn't have a profile record in the database.
                    Use the "Fix Admin Access" tab to create one.
                  </li>
                  <li>
                    <strong>Role not set to admin:</strong> Your profile exists but doesn't have the admin role.
                    Use the "Fix Admin Access" tab to update it.
                  </li>
                  <li>
                    <strong>Session issues:</strong> Your browser session might be corrupted. Try signing out completely and signing back in.
                  </li>
                  <li>
                    <strong>Middleware blocking:</strong> The middleware might be blocking access to admin routes.
                    We've updated it to allow access, but you might need to restart the server.
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Steps to Fix</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to the "Fix Admin Access" tab and run the fix</li>
                  <li>Sign out completely (use the "Force Sign Out" button)</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Sign in again with your credentials</li>
                  <li>Try accessing the admin dashboard from the user menu</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Diagnostic Pages</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/${t('locale')}/admin-check`} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Admin Check
                  </Link>
                  <Link 
                    href={`/${t('locale')}/admin-fix`} 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Admin Fix
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}