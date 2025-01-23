'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from './components/user-management'
import { PropertyManagement } from './components/property-management'
import { BookingsManagement } from './components/bookings-management'
import { CalendarManagement } from './components/calendar-management'
import { DashboardHeader } from './components/dashboard-header'
import { DashboardStats } from './components/dashboard-stats'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-client'
import { useParams } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
const validStatuses = ['available', 'pending', 'booked', 'sold'] as const

export default function AdminDashboard() {
  const t = useTranslations('auth.adminSection')
  interface PropertyStat {
    status?: 'available' | 'pending' | 'booked' | 'sold'
  }
  
  const [stats, setStats] = useState<PropertyStat[]>([])

  useParams() // We keep this to maintain the hook call but don't destructure unused variable

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('properties').select('status')
        const filteredStats = (data || [])
          .filter((p): p is { status: PropertyStat['status'] } => 
            p.status !== null && validStatuses.includes(p.status as PropertyStat['status'])
          )
          .map(p => ({ status: p.status }))
        setStats(filteredStats)
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
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-10 px-4">
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
              <CalendarManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </QueryClientProvider>
  )
}
