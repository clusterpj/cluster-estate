'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState, createContext, useContext, ReactNode } from 'react'
import { Check, Copy, MoreHorizontal, Mail, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { 
  BookingStatus, 
  PaymentStatus,
  formatBookingStatus, 
  formatPaymentStatus, 
  getAvailableActions 
} from '@/lib/booking-status-utils'

type BookingWithDetails = Omit<Database['public']['Tables']['bookings']['Row'], 'user'> & {
  property: Pick<
    Database['public']['Tables']['properties']['Row'],
    'title' | 'location' | 'images'
  >
  guest_details: {
    email: string
    raw_user_meta_data: {
      full_name: string
    }
  }
  payment_details?: {
    authorizationId: string
    payerID: string
    orderID: string
    status: string
  }
}

// Create a context for the booking columns
const BookingsColumnContext = createContext<{
  columns: ColumnDef<BookingWithDetails>[]
}>({ columns: [] })

// Export the provider component that was missing
export function BookingsColumnProvider({ children }: { children: ReactNode }) {
  // Use the columns defined below
  return (
    <BookingsColumnContext.Provider value={{ columns }}>
      {children}
    </BookingsColumnContext.Provider>
  )
}

// Export a hook to consume the columns
export function useBookingsColumns() {
  return useContext(BookingsColumnContext)
}

const IdCell = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false)
  const truncatedId = `#${id.slice(0, 6)}...`

  const handleCopy = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="font-mono hover:bg-accent px-2 py-1 rounded-md transition-colors flex items-center gap-2"
            >
              <span>{truncatedId}</span>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 opacity-50 hover:opacity-100" />
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to copy full ID</p>
          <p className="text-xs text-muted-foreground">{id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const PropertyCell = ({ property }: { property: BookingWithDetails['property'] }) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={property.images?.[0]} alt={property.title} />
        <AvatarFallback>
          {property.title
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{property.title}</span>
        <span className="text-sm text-muted-foreground">{property.location}</span>
      </div>
    </div>
  )
}

const GuestCell = ({ guest_details }: { guest_details: BookingWithDetails['guest_details'] }) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{guest_details.raw_user_meta_data.full_name}</span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{guest_details.email}</span>
        </div>
      </div>
    </div>
  )
}

export const columns: ColumnDef<BookingWithDetails>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking ID" />
    ),
    cell: ({ row }) => <IdCell id={row.getValue('id')} />,
  },
  {
    accessorKey: 'property',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property" />
    ),
    cell: ({ row }) => <PropertyCell property={row.getValue('property')} />,
  },
  {
    accessorKey: 'guest_details',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guest" />
    ),
    cell: ({ row }) => <GuestCell guest_details={row.getValue('guest_details')} />,
  },
  {
    accessorKey: 'check_in',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check-in" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('check_in')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'check_out',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check-out" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('check_out')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as BookingStatus
      const formattedStatus = formatBookingStatus(status)
      
      return (
        <Badge className={formattedStatus.className}>
          {formattedStatus.label}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const t = useTranslations()
      const status = row.getValue('payment_status') as PaymentStatus
      const paymentDetails = row.original.payment_details
      const formattedStatus = formatPaymentStatus(status)

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={formattedStatus.variant} className="capitalize">
                {t(`bookings.payment_status.${status}`, { defaultValue: formattedStatus.label })}
              </Badge>
            </TooltipTrigger>
            {paymentDetails && (
              <TooltipContent>
                <div className="space-y-1">
                  {paymentDetails.orderID && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order ID:</span>
                      <span className="text-sm">{paymentDetails.orderID}</span>
                    </div>
                  )}
                  {paymentDetails.authorizationId && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Auth ID:</span>
                      <span className="text-sm">{paymentDetails.authorizationId}</span>
                    </div>
                  )}
                  {paymentDetails.payerID && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Payer ID:</span>
                      <span className="text-sm">{paymentDetails.payerID}</span>
                    </div>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'total_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => formatPrice(row.getValue('total_price')),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM d, h:mm a'),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const booking = row.original
      const [isLoading, setIsLoading] = useState(false)
      const { toast } = useToast()
      const t = useTranslations()
      const queryClient = useQueryClient()
      
      // Log the actual status for debugging
      console.log('Booking status:', booking.status, 'Payment status:', booking.payment_status)
      
      const bookingStatus = booking.status as BookingStatus
      const paymentStatus = booking.payment_status as PaymentStatus
      const availableActions = getAvailableActions(bookingStatus, paymentStatus)
      
      // Log available actions for debugging
      console.log('Available actions:', availableActions)

      const handleAction = async (action: 'approve' | 'reject' | 'capture' | 'mark_completed' | 'mark_failed' | 'mark_pending') => {
        try {
          setIsLoading(true)
          let endpoint = ''
          let payload = {}

          switch (action) {
            case 'capture':
              endpoint = '/api/admin/capture-payment'
              payload = {
                bookingId: booking.id,
                authorizationId: booking.payment_details?.authorizationId
              }
              break
            case 'approve':
            case 'reject':
              endpoint = '/api/admin/approve-booking'
              payload = {
                bookingId: booking.id,
                approved: action === 'approve',
                reason: action === 'approve' ? 'Admin approved' : 'Admin rejected'
              }
              break
            case 'mark_completed':
              if (paymentStatus === 'authorized' && booking.payment_details?.orderID) {
                endpoint = '/api/admin/capture-payment'
                payload = {
                  bookingId: booking.id,
                  orderId: booking.payment_details.orderID
                }
              } else {
                endpoint = '/api/admin/update-payment-status'
                payload = {
                  bookingId: booking.id,
                  status: 'completed'
                }
              }
              break
            case 'mark_failed':
            case 'mark_pending':
              endpoint = '/api/admin/update-payment-status'
              payload = {
                bookingId: booking.id,
                status: action === 'mark_failed' ? 'failed' : 'pending'
              }
              break
          }

          console.log('Sending request to:', endpoint, 'with payload:', payload)
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          const data = await response.json()
          console.log('Response:', data)

          if (!response.ok) {
            throw new Error(data.error || 'Failed to process request')
          }

          toast({
            title: t('Success'),
            description: action === 'mark_completed' && 'orderId' in payload
              ? t('admin.bookings.paymentCaptured')
              : t('admin.bookings.statusUpdated'),
            variant: 'default',
          })

          // Refresh the data without page reload
          await queryClient.invalidateQueries(['admin-bookings'])
        } catch (error) {
          console.error('Error:', error)
          toast({
            title: t('Error'),
            description: error instanceof Error 
              ? t(`admin.bookings.errors.${error.message.toLowerCase()}`, { defaultValue: t('admin.bookings.errors.updateError') }) 
              : t('admin.bookings.errors.updateError'),
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => {
              // Additional debug when button is clicked
              console.log('MENU CLICKED - Status:', bookingStatus);
              console.log('MENU CLICKED - Actions:', availableActions);
            }}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('admin.bookings.actions')}</DropdownMenuLabel>
            
            {/* Booking Status Actions */}
            {availableActions.canApprove && (
              <DropdownMenuItem
                onClick={() => handleAction('approve')}
                disabled={isLoading}
              >
                {isLoading ? t('admin.bookings.approving') : t('admin.bookings.approve')}
              </DropdownMenuItem>
            )}
            
            {availableActions.canReject && (
              <DropdownMenuItem
                onClick={() => handleAction('reject')}
                disabled={isLoading}
                className="text-red-600"
              >
                {isLoading ? t('admin.bookings.rejecting') : t('admin.bookings.reject')}
              </DropdownMenuItem>
            )}
            
            {(availableActions.canApprove || availableActions.canReject) && (
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t('admin.bookings.approvalNote')}
              </DropdownMenuLabel>
            )}

            {/* Payment Status Actions */}
            {(availableActions.canMarkCompleted || availableActions.canMarkFailed || availableActions.canMarkPending) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('admin.bookings.updatePaymentStatus')}</DropdownMenuLabel>
                
                {availableActions.canMarkCompleted && (
                  <DropdownMenuItem
                    onClick={() => handleAction('mark_completed')}
                    disabled={isLoading}
                  >
                    {isLoading ? t('admin.bookings.updating') : t('admin.bookings.markCompleted')}
                  </DropdownMenuItem>
                )}
                
                {availableActions.canMarkFailed && (
                  <DropdownMenuItem
                    onClick={() => handleAction('mark_failed')}
                    disabled={isLoading}
                    className="text-red-600"
                  >
                    {isLoading ? t('admin.bookings.updating') : t('admin.bookings.markFailed')}
                  </DropdownMenuItem>
                )}
                
                {availableActions.canMarkPending && (
                  <DropdownMenuItem
                    onClick={() => handleAction('mark_pending')}
                    disabled={isLoading}
                  >
                    {isLoading ? t('admin.bookings.updating') : t('admin.bookings.markPending')}
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
]