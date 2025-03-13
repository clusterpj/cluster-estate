'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'
import { BookingWithDetails } from '../bookings-columns'
import { format } from 'date-fns'
import { formatPrice, cn } from '@/lib/utils'
import { formatBookingStatus, BookingStatus } from '@/lib/booking-status-utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Mail, Calendar, Home, CreditCard, Clock, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

// Define property type to avoid 'never' type errors
interface PropertyDetails {
  id?: string;
  title: string;
  location: string;
  images: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
}

// Extended booking type with additional properties needed for the details dialog
interface ExtendedBookingDetails extends Omit<BookingWithDetails, 'property'> {
  property: PropertyDetails;
  notes?: string;
}

interface BookingDetailsDialogProps {
  bookingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDetailsDialog({ bookingId, open, onOpenChange }: BookingDetailsDialogProps) {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState('details')

  const { data: booking, isLoading } = useQuery<ExtendedBookingDetails>({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      try {
        const supabase = createClientComponentClient<Database>()
        
        // Fetch booking with property details
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(
              id,
              title,
              location,
              images,
              description,
              bedrooms,
              bathrooms
            )
          `)
          .eq('id', bookingId)
          .single()
        
        if (error) {
          console.error('Error fetching booking details:', error)
          throw error
        }

        if (!bookingData) {
          throw new Error('Booking not found')
        }

        // Safely extract property data with fallbacks
        const propertyData = bookingData.property as any || {}
        
        // Fetch guest details from profiles table
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', bookingData.user_id)
          .single()
        
        if (userError) {
          console.error('Error fetching user details:', userError)
          // Continue anyway, we'll show what we have
        }

        // Transform the data to match ExtendedBookingDetails type
        const transformedBooking: ExtendedBookingDetails = {
          ...bookingData,
          property: {
            id: propertyData.id,
            title: propertyData.title || 'Unknown Property',
            location: propertyData.location || 'Unknown Location',
            images: Array.isArray(propertyData.images) ? propertyData.images : [],
            description: propertyData.description,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms
          },
          guest_details: userData ? {
            email: userData.email || 'N/A',
            raw_user_meta_data: { 
              full_name: userData.full_name || 'N/A'
            }
          } : {
            email: 'N/A',
            raw_user_meta_data: { full_name: 'N/A' }
          },
          notes: (bookingData as any).special_requests // Map special_requests to notes
        }

        return transformedBooking
      } catch (error) {
        console.error('Error in booking details query:', error)
        throw error
      }
    },
    enabled: open,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('admin.bookings.bookingDetails')}</DialogTitle>
            <DialogDescription>{t('admin.bookings.loading')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('admin.bookings.detailsNotFound')}</DialogTitle>
            <DialogDescription>
              {t('admin.bookings.detailsNotFoundDescription')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  // Helper function to determine badge variant
  const getBadgeVariant = (status: string) => {
    if (status === 'confirmed') return 'default' as const
    if (status === 'canceled') return 'destructive' as const
    return 'secondary' as const
  }

  // Safely format booking status
  const safeFormatBookingStatus = (status: string): string => {
    try {
      const formattedStatus = formatBookingStatus(status as BookingStatus);
      // Return the label property from the FormattedStatus object
      return formattedStatus.label;
    } catch (error) {
      return status // Fallback to raw status if formatting fails
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col" hideDefaultClose>
        <div className="absolute right-4 top-4">
          <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('admin.bookings.bookingDetails')}</span>
            <Badge variant={getBadgeVariant(booking.status)}>
              {safeFormatBookingStatus(booking.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {t('admin.bookings.bookingId')}: {booking.id}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">{t('admin.bookings.details')}</TabsTrigger>
            <TabsTrigger value="property">{t('admin.bookings.property')}</TabsTrigger>
            <TabsTrigger value="guest">{t('admin.bookings.guest')}</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t('admin.bookings.checkIn')}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(booking.check_in), 'PPP')}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t('admin.bookings.checkOut')}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(booking.check_out), 'PPP')}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t('admin.bookings.guests')}</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guests} {t('admin.bookings.guestsCount')}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t('admin.bookings.pricing')}</div>
                {/* Simplify pricing display to only show total price since we don't have the breakdown */}
                <div className="flex items-center justify-between font-medium">
                  <span>{t('admin.bookings.totalPrice')}</span>
                  <span className="text-lg">{formatPrice(booking.total_price)}</span>
                </div>
              </div>
              
              {booking.payment_details && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{t('admin.bookings.paymentDetails')}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('admin.bookings.paymentId')}:</span>
                        <span>{booking.payment_details.orderID}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('admin.bookings.paymentStatus')}:</span>
                        <Badge variant="outline">{booking.payment_details.status}</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t('admin.bookings.bookingDates')}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t('admin.bookings.createdAt')}:</span>
                    <span>{format(new Date(booking.created_at), 'PPP p')}</span>
                  </div>
                  {booking.updated_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('admin.bookings.updatedAt')}:</span>
                      <span>{format(new Date(booking.updated_at), 'PPP p')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {booking.notes && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{t('admin.bookings.notes')}</div>
                    <div className="p-3 bg-muted rounded-md">
                      {booking.notes}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              {booking.property ? (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={booking.property.images?.[0]} alt={booking.property.title} />
                      <AvatarFallback>
                        <Home className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{booking.property.title}</h3>
                      <p className="text-sm text-muted-foreground">{booking.property.location}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{t('admin.bookings.beds')}</div>
                      <div className="text-sm">{booking.property.bedrooms || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{t('admin.bookings.baths')}</div>
                      <div className="text-sm">{booking.property.bathrooms || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{t('admin.bookings.description')}</div>
                    <div className="text-sm">{booking.property.description || t('admin.bookings.noDescription')}</div>
                  </div>
                  
                  {booking.property.images && booking.property.images.length > 0 && (
                    <>
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">{t('admin.bookings.images')}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {booking.property.images.slice(0, 6).map((image, index) => (
                            <img 
                              key={index} 
                              src={image} 
                              alt={`${booking.property.title} - ${index + 1}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">{t('admin.bookings.propertyNotFound')}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="guest" className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{booking.guest_details.raw_user_meta_data.full_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{booking.guest_details.email}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{t('admin.bookings.bookingHistory')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('admin.bookings.bookingHistoryEmpty')}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
