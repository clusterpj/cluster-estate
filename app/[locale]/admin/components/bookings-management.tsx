'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BookingWithDetails, columns } from './bookings-columns'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/types/database.types'
import { Loader2 } from 'lucide-react'
import { BookingsColumnProvider } from './bookings-columns'

const ITEMS_PER_PAGE = 10

export function BookingsManagement() {
  const t = useTranslations()
  const [status, setStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data: bookingsData, isLoading } = useQuery<{
    bookings: BookingWithDetails[];
    total: number;
  }>({
    queryKey: ['admin-bookings', status, searchQuery, page],
    queryFn: async () => {
      try {
        // First, get the total count
        const supabase = createClientComponentClient<Database>()
        let countQuery = supabase
          .from('bookings')
          .select('id', { count: 'exact' })
        
        if (status !== 'all') {
          countQuery = countQuery.eq('status', status)
        }
        
        const { count: total, error: countError } = await countQuery
        
        if (countError) {
          console.error('Error counting bookings:', countError)
          throw countError
        }

        // Now get the actual bookings with details
        let query = supabase
          .from('bookings')
          .select(`
            *,
            property:properties(
              title,
              location,
              images
            )
          `)
          .order('created_at', { ascending: false })

        if (status !== 'all') {
          query = query.eq('status', status)
        }

        if (searchQuery) {
          query = query.or(`
            property.title.ilike.%${searchQuery}%
          `)
        }

        const { data: bookings, error } = await query
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

        if (error) {
          console.error('Error fetching bookings:', error)
          throw error
        }

        // Transform the data to match BookingWithDetails type
        const transformedBookings = bookings.map(booking => {
          return {
            ...booking,
            property: booking.property || null,
            guest_details: {
              email: "Loading...",
              raw_user_meta_data: { full_name: "Loading..." }
            }
          } as unknown as BookingWithDetails
        })

        return { 
          bookings: transformedBookings, 
          total: total || 0 
        }
      } catch (error) {
        console.error('Error in bookings query:', error)
        throw error
      }
    },
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <BookingsColumnProvider>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder={t('admin.bookings.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[300px]"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('admin.bookings.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.bookings.allStatuses')}</SelectItem>
                <SelectItem value="awaiting_approval">{t('bookings.status.awaiting_approval')}</SelectItem>
                <SelectItem value="pending">{t('bookings.status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('bookings.status.confirmed')}</SelectItem>
                <SelectItem value="canceled">{t('bookings.status.canceled')}</SelectItem>
                <SelectItem value="expired">{t('bookings.status.expired')}</SelectItem>
                <SelectItem value="payment_failed">{t('bookings.status.payment_failed')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setPage(1)}>{t('admin.bookings.search')}</Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookingsData?.bookings || []}
          pageCount={Math.ceil((bookingsData?.total || 0) / ITEMS_PER_PAGE)}
          pageSize={ITEMS_PER_PAGE}
          page={page}
          onPageChange={setPage}
          searchKey="property"
          emptyMessage={t('admin.bookings.noResults')}
        />
      </div>
    </BookingsColumnProvider>
  )
}