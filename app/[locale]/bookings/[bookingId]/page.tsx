import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookingWithProperty, BookingStatus } from '@/types/booking';

// Helper function to get badge variant based on status
function getStatusBadgeVariant(status: BookingStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'default';
    case 'pending':
    case 'awaiting-approval':
      return 'secondary';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default async function BookingConfirmation({
  params,
}: {
  params: { bookingId: string; locale: string }
}) {
  const t = await getTranslations('BookingConfirmation');
  const supabase = createServerClient();

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, property:properties(*)')
      .eq('id', params.bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      if (error.code === 'PGRST116') {
        notFound();
      }
      throw new Error(t('errors.fetch_failed'));
    }

    if (!booking) {
      notFound();
    }

    const bookingData = booking as BookingWithProperty;
    const statusVariant = getStatusBadgeVariant(bookingData.status);
    
    return (
      <div className="container max-w-2xl pt-16 pb-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('booking_id')}: {bookingData.id}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status badge - more prominent */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t('status_label')}:</span>
              <Badge className="w-fit px-3 py-1" variant={statusVariant}>
                {t(`status.${bookingData.status}`)}
              </Badge>
            </div>
            
            {/* If booking is awaiting approval, show info alert */}
            {bookingData.status === 'awaiting-approval' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('awaiting_approval.title')}</AlertTitle>
                <AlertDescription>
                  {t('awaiting_approval.description')}
                </AlertDescription>
              </Alert>
            )}

            {/* Property details */}
            <div className="space-y-2 border-b pb-4">
              <h3 className="font-medium">{t('property')}</h3>
              <p className="text-lg font-semibold">{bookingData.property?.title}</p>
              {bookingData.property?.location && (
                <p className="text-sm text-gray-500">{bookingData.property.location}</p>
              )}
            </div>

            {/* Booking details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t('check_in')}</span>
                <p className="font-medium">
                  {new Intl.DateTimeFormat(params.locale, {
                    dateStyle: 'long',
                  }).format(new Date(bookingData.check_in))}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">{t('check_out')}</span>
                <p className="font-medium">
                  {new Intl.DateTimeFormat(params.locale, {
                    dateStyle: 'long',
                  }).format(new Date(bookingData.check_out))}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">{t('guests')}</span>
                <p className="font-medium">{bookingData.guests}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">{t('total')}</span>
                <p className="font-medium">
                  {new Intl.NumberFormat(params.locale, {
                    style: 'currency',
                    currency: 'USD',
                  }).format(bookingData.total_price)}
                </p>
              </div>
            </div>

            {/* Payment information */}
            {bookingData.payment_status && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium">{t('payment_info')}</h3>
                <div className="flex justify-between">
                 <span className="text-sm text-muted-foreground">{t('payment_status_label')}</span>
                  <Badge variant={bookingData.payment_status === 'captured' ? 'default' : 'outline'}>
                    {t(`payment_status.${bookingData.payment_status}`, {
                      defaultValue: bookingData.payment_status // Fallback if translation is missing
                    })}
                  </Badge>
                </div>
                {bookingData.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('payment_id')}</span>
                    <span className="text-xs font-mono">{bookingData.payment_id}</span>
                  </div>
                )}
              </div>
            )}

            {/* Special requests */}
            {bookingData.special_requests && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium">{t('special_requests')}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{bookingData.special_requests}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" asChild>
              <a href={`/${params.locale}/dashboard`}>{t('go_to_dashboard')}</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error in booking confirmation page:', error);
    // You should create an error component that follows your design system
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('errors.title')}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t('errors.unknown')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}