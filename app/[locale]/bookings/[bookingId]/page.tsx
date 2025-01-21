import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
            <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
              {t(booking.status)}
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
                currency: booking.currency,
              }).format(booking.total_amount)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}