import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingStatus } from '@/types/booking'

// Helper function to get the appropriate badge variant based on status
const getStatusVariant = (status: BookingStatus) => {
  switch (status) {
    case 'confirmed':
      return 'default' // green
    case 'awaiting-approval':
      return 'secondary' // neutral/waiting
    case 'completed':
      return 'success' // completed
    case 'canceled':
      return 'destructive' // red
    default:
      return 'outline' // fallback for pending or unknown states
  }
}

export default async function BookingConfirmation({
  params,
}: {
  params: { bookingId: string; locale: string }
}) {
  const t = await getTranslations('BookingConfirmation')
  const supabase = createServerClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, property:properties(*)')
    .eq('id', params.bookingId)
    .single()

  if (error || !booking) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>{t('status')}:</span>
            <Badge variant={getStatusVariant(booking.status as BookingStatus)}>
              {t(`status.${booking.status}`)}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium">{t('property')}</h3>
            <p>{booking.property?.title}</p>
          </div>

          <div className="flex justify-between">
            <span>{t('total')}:</span>
            <span className="font-medium">
              {new Intl.NumberFormat(params.locale, {
                style: 'currency',
                currency: 'USD',
              }).format(booking.total_price)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>{t('check_in')}:</span>
            <span>{new Date(booking.check_in).toLocaleDateString(params.locale)}</span>
          </div>

          <div className="flex justify-between">
            <span>{t('check_out')}:</span>
            <span>{new Date(booking.check_out).toLocaleDateString(params.locale)}</span>
          </div>

          <div className="flex justify-between">
            <span>{t('guests')}:</span>
            <span>{booking.guests}</span>
          </div>

          {booking.special_requests && (
            <div>
              <h3 className="font-medium">{t('special_requests')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.special_requests}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}