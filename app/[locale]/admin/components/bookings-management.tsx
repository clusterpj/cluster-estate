'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-browser'
import { Database } from '@/types/database.types'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './bookings-columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

type BookingWithDetails = {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  property_id: string
  check_in: string
  check_out: string
  status: string
  payment_status: string
  total_price: number
  property: {
    title: string
    location: string
    images: string[]
  }
  guest_details: {
    email: string
    raw_user_meta_data: {
      full_name: string
    }
  }
}

const ITEMS_PER_PAGE = 10

export function BookingsManagement() {
  const t = useTranslations()
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: bookingsData, isLoading } = useQuery<{
    bookings: BookingWithDetails[]
    total: number
  }>({
    queryKey: ['admin-bookings', status, search, page],
    queryFn: async () => {
      try {
        // First, get the total count
        let countQuery = supabase
          .from('bookings')
          .select('id', { count: 'exact' })

        if (status !== 'all') {
          countQuery = countQuery.eq('status', status)
        }

        const { count: total, error: countError } = await countQuery

        if (countError) {
          console.error('Error getting count:', countError)
          throw countError
        }

        // Try to use the RPC function first
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_bookings_with_details', {
            p_limit: ITEMS_PER_PAGE,
            p_offset: (page - 1) * ITEMS_PER_PAGE,
            p_status: status === 'all' ? null : status,
            p_search: search || null
          })

        // If RPC fails, fallback to direct query
        if (rpcError?.code === '42883' || rpcError?.code === '404') {
          console.warn('RPC function not available, falling back to direct query')
          const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
              *,
              property:properties(
                title,
                location,
                images
              ),
              guest_details:users!bookings_user_id_fkey(
                email,
                raw_user_meta_data
              )
            `)
            .order('created_at', { ascending: false })
            .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

          if (error) {
            console.error('Error fetching bookings:', error)
            throw error
          }

          // Filter results by search term if provided
          let filteredData = bookings || []
          if (search) {
            const searchLower = search.toLowerCase()
            filteredData = filteredData.filter((booking) => {
              const propertyTitle = booking.property?.title?.toLowerCase() || ''
              const guestName = booking.guest_details?.raw_user_meta_data?.full_name?.toLowerCase() || ''
              const guestEmail = booking.guest_details?.email?.toLowerCase() || ''
              
              return (
                propertyTitle.includes(searchLower) ||
                guestName.includes(searchLower) ||
                guestEmail.includes(searchLower)
              )
            })
          }

          return {
            bookings: filteredData as BookingWithDetails[],
            total: search ? filteredData.length : (total || 0),
          }
        }

        if (rpcError) {
          console.error('Error fetching bookings:', rpcError)
          throw rpcError
        }

        return {
          bookings: rpcData as BookingWithDetails[],
          total: total || 0,
        }
      } catch (error) {
        console.error('Query error:', error)
        throw error
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.bookings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder={t('admin.bookings.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[300px]"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('admin.bookings.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.bookings.allStatuses')}</SelectItem>
                <SelectItem value="pending">{t('bookings.status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('bookings.status.confirmed')}</SelectItem>
                <SelectItem value="canceled">{t('bookings.status.canceled')}</SelectItem>
                <SelectItem value="expired">{t('bookings.status.expired')}</SelectItem>
                <SelectItem value="payment_failed">{t('bookings.status.payment_failed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookingsData?.bookings || []}
          pageCount={Math.ceil((bookingsData?.total || 0) / ITEMS_PER_PAGE)}
          pageSize={ITEMS_PER_PAGE}
          page={page}
          onPageChange={setPage}
          searchKey="id"
          emptyMessage={t('admin.bookings.noResults')}
        />
      </CardContent>
    </Card>
  )
}
