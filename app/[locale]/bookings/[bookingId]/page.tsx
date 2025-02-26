import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { BookingStatus } from '@/types/booking'
import { Calendar, MapPin, Users, CreditCard, FileText, } from 'lucide-react'

// Helper function to get the appropriate badge variant based on status
const getStatusVariant = (status: BookingStatus): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'confirmed':
      return 'default' 
    case 'awaiting-approval':
      return 'secondary'
    case 'completed':
      return 'default'
    case 'canceled':
      return 'destructive'
    case 'payment_failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Strategic mapping function that transforms database values to translation-friendly keys
const getTranslationKey = (status: string): string => {
  return status.replace(/-/g, '_');
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

  // Format dates for better readability
  const checkInDate = new Date(booking.check_in)
  const checkOutDate = new Date(booking.check_out)
  
  const formattedCheckIn = checkInDate.toLocaleDateString(params.locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  const formattedCheckOut = checkOutDate.toLocaleDateString(params.locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  // Calculate number of nights for stay duration
  const nightsCount = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <div className="container max-w-2xl">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-primary h-1 w-full" />
          
          <CardHeader className="pb-2 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-xl">{t('title')}</CardTitle>
              <Badge variant={getStatusVariant(booking.status as BookingStatus)} className="self-start sm:self-auto">
                {t(`status.${getTranslationKey(booking.status)}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('booking_id')}: <span className="font-mono">{booking.id}</span>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Payment Info Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">
                  {t('payment_authorization_notice')}
                </p>
              </div>
            </div>
            
            {/* Property Section */}
            <div className="bg-muted/40 rounded-xl p-4">
              <h3 className="text-base font-medium mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                {t('property')}
              </h3>
              <p className="text-lg font-semibold mb-1">{booking.property?.title}</p>
              {booking.property?.location && (
                <p className="text-muted-foreground text-sm">{booking.property.location}</p>
              )}
            </div>
            
            {/* Stay Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {t('check_in')}
                </h4>
                <p className="font-medium">{formattedCheckIn}</p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {t('check_out')}
                </h4>
                <p className="font-medium">{formattedCheckOut}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-muted/30 rounded-xl p-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">{t('guests')}</span>
              </div>
              <span className="font-medium">{booking.guests}</span>
            </div>
            
            {/* Payment Section */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary" />
                {t('payment_info')}
              </h3>
              
              <div className="space-y-2">
                {booking.payment_id && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t('payment_id')}</span>
                    <span className="font-mono">{booking.payment_id}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t('status_label')}</span>
                  <Badge variant={booking.payment_status === 'completed' ? 'default' : 'outline'}>
                    {t(`payment_status.${booking.payment_status}`)}
                  </Badge>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                  <span className="text-xl font-bold">
                    {new Intl.NumberFormat(params.locale, {
                      style: 'currency',
                      currency: 'USD',
                    }).format(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Special Requests Section */}
            {booking.special_requests && (
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  {t('special_requests')}
                </h3>
                <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                {t('go_to_dashboard')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}