'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-client'
import { Booking } from '@/types/booking'
import { DataTable } from '../../../../components/ui/data-table'
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
        const rawBookings = data ?? [];
        const mappedBookings = rawBookings.map(booking => {
          return {
  
            ...booking,
              // Required fields with defaults
              payment_status: booking.payment_status ?? "pending",
              status: booking.status ?? "pending",
              // Optional fields converted from null to undefined
              payment_id: booking.payment_id ?? undefined,
              special_requests: booking.special_requests ?? undefined,
              calendar_event_id: booking.calendar_event_id ?? undefined,
              external_source: booking.external_source ?? undefined,
              external_id: booking.external_id ?? undefined,
              is_external: booking.is_external ?? false
          };
        });
        setBookings(mappedBookings);
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
    <DataTable
      columns={columns}
      data={bookings}
      searchKey="id"
      emptyMessage={t('bookings.noBookings')}
    />
  )
}
