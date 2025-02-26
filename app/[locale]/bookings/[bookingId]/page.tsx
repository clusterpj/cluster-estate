import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BookingStatus, PaymentStatus } from '@/types/booking'
import { Calendar, CheckCircle, Clock, Ban, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Helper function to get the appropriate badge variant based on status
const getStatusVariant = (status: BookingStatus): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'confirmed':
      return 'default' // green
    case 'pending':
      return 'secondary' // neutral/waiting
    case 'completed':
      return 'default' // green
    case 'canceled':
      return 'destructive' // red
    case 'payment_failed':
      return 'destructive' // red
    case 'expired':
      return 'outline' // neutral
    default:
      return 'outline' // fallback for unknown states
  }
}

// Helper function to get the appropriate payment badge variant
const getPaymentStatusVariant = (status: PaymentStatus): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'captured':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'refunded':
      return 'outline'
    default:
      return 'secondary' // pending
  }
}

// Helper function to get the appropriate icon based on status
const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-5 w-5" />
    case 'completed':
      return <CheckCircle className="h-5 w-5" />
    case 'pending':
      return <Clock className="h-5 w-5" />
    case 'canceled':
      return <Ban className="h-5 w-5" />
    default:
      return <Clock className="h-5 w-5" />
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

  // Check if we should show the pending approval alert
  const showPendingAlert = booking.status === 'pending'

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-4">
        <Link href="/bookings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back_to_bookings')}
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>{t('title')}</CardTitle>
            <Badge variant={getStatusVariant(booking.status as BookingStatus)}>
              {t(`status.${booking.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('booking_id')}: {booking.id}
          </p>
        </CardHeader>
        
        {showPendingAlert && (
          <div className="px-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>{t('awaiting_approval.title')}</AlertTitle>
              <AlertDescription>
                {t('awaiting_approval.description')}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent className="space-y-5 pt-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium text-lg mb-3">{t('property')}</h3>
            <p className="text-xl font-semibold mb-1">{booking.property?.title}</p>
            {booking.property?.location && (
              <p className="text-muted-foreground">{booking.property.location}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                {t('check_in')}
              </div>
              <p className="font-medium">
                {new Date(booking.check_in).toLocaleDateString(params.locale, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                {t('check_out')}
              </div>
              <p className="font-medium">
                {new Date(booking.check_out).toLocaleDateString(params.locale, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted/30 p-4">
            <h3 className="font-medium mb-3">{t('payment_info')}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('payment_status_label')}:</span>
                <Badge variant={getPaymentStatusVariant(booking.payment_status as PaymentStatus)}>
                  {t(`payment_status.${booking.payment_status}`)}
                </Badge>
              </div>
              
              {booking.payment_id && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('payment_id')}:</span>
                  <span className="font-mono text-sm">{booking.payment_id}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">{t('total')}:</span>
                <span className="text-xl font-bold">
                  {new Intl.NumberFormat(params.locale, {
                    style: 'currency',
                    currency: 'USD',
                  }).format(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('guests')}:</span>
            <span className="font-medium">{booking.guests}</span>
          </div>

          {booking.special_requests && (
            <div className="rounded-lg bg-muted/30 p-4">
              <h3 className="font-medium mb-2">{t('special_requests')}</h3>
              <p className="text-muted-foreground">{booking.special_requests}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              {t('go_to_dashboard')}
            </Link>
          </Button>
          
          {booking.status !== 'canceled' && booking.status !== 'completed' && (
            <Button variant="secondary">
              {t('cancel_booking')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}