'use client'

import type { Database } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from './components/user-management'
import { PropertyManagement } from './components/property-management'
import { BookingsManagement } from './components/bookings-management'
import { DashboardHeader } from './components/dashboard-header'
import { DashboardStats } from './components/dashboard-stats'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-client'
import { useParams } from 'next/navigation'

export default function AdminDashboard() {
  const t = useTranslations('auth.adminSection')
  const [stats, setStats] = useState<any[]>([])
  const { locale } = useParams()

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('properties').select('status')
        setStats(data || [])
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  const totalProperties = stats?.length || 0
  const availableProperties = stats?.filter(p => p.status === 'available').length || 0
  const soldProperties = stats?.filter(p => p.status === 'sold').length || 0
  const pendingProperties = stats?.filter(p => p.status === 'pending').length || 0

  return (
    <div className="container mx-auto py-10">
      <DashboardHeader />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardStats
          stats={[
            { title: t('stats.totalProperties'), value: totalProperties },
            { title: t('stats.available'), value: availableProperties },
            { title: t('stats.sold'), value: soldProperties },
            { title: t('stats.pending'), value: pendingProperties },
          ]}
        />
      </div>

      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">{t('tabs.properties')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="bookings">{t('tabs.bookings')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('tabs.calendar')}</TabsTrigger>
        </TabsList>
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingsManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>{t('calendar.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">iCal Integration</h3>
                  <Button variant="outline">
                    Sync Calendar
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground">
                    Calendar sync coming soon. This feature will allow you to:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-muted-foreground">
                    <li>Sync property availability with external calendars</li>
                    <li>Import bookings from other platforms</li>
                    <li>Export your calendar to iCal format</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
