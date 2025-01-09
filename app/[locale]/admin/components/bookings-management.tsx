'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-client'
import { Booking } from '@/types/booking'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './bookings-columns'

export function BookingsManagement() {
  const t = useTranslations('auth.adminSection')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBookings(data || [])
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError(t('bookings.fetchError'))
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [t])

  if (loading) return <div>{t('bookings.loading')}</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bookings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={bookings}
          searchKey="id"
          emptyMessage={t('bookings.noBookings')}
        />
      </CardContent>
    </Card>
  )
}
