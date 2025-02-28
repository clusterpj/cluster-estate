'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState, createContext, useContext, ReactNode } from 'react'
import { Check, MoreHorizontal, Mail, User, ExternalLink, X, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { 
  BookingStatus, 
  formatBookingStatus, 
  getAvailableActions 
} from '@/lib/booking-status-utils'
// Import error handling utilities
import { AppError, ErrorType } from '@/lib/error-handling-utils'
import { useErrorHandler } from '@/lib/use-error-handler'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from 'next-intl'

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

// Component for actions cell
function ActionsCell({ row }: { row: any }) {
  const booking = row.original
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const t = useTranslations()
  // Use the error handler hook
  const { withErrorHandling } = useErrorHandler()
  
  // Log booking details for debugging
  console.log('Booking status:', booking.status)
  
  const bookingStatus = booking.status as BookingStatus
  const availableActions = getAvailableActions(bookingStatus)
  
  // Log available actions for debugging
  console.log('Available actions:', availableActions)

  const handleAction = withErrorHandling(async (action: string) => {
    setIsLoading(true)
    try {
      let endpoint = ''
      let method = 'POST'
      let payload: any = {}
      let successMessage = ''
      
      switch (action) {
        case 'approve':
          endpoint = '/api/admin/approve-booking'
          payload = {
            bookingId: booking.id,
            approved: true
          }
          successMessage = t('admin.bookings.statusUpdated')
          break
        case 'reject':
          endpoint = '/api/admin/approve-booking'
          payload = {
            bookingId: booking.id,
            approved: false,
            reason: 'Admin rejected'
          }
          successMessage = t('admin.bookings.statusUpdated')
          break
        default:
          throw new AppError(
            t('admin.bookings.errors.updateError'),
            ErrorType.VALIDATION
          )
      }
      
      console.log('Sending request to:', endpoint, 'with payload:', payload)
      
      // Make the API request
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new AppError(
          errorData.error || errorData.message || t('admin.bookings.errors.updateError'),
          ErrorType.SERVER,
          response.status
        )
      }
      
      // Parse the response
      const responseData = await response.json()
      console.log('API success response:', responseData)
      
      // Show success message
      toast({
        title: t('Success'),
        description: successMessage,
      })
      
      // Invalidate the bookings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    } catch (error) {
      // Error will be handled by withErrorHandling
      throw error
    } finally {
      setIsLoading(false)
    }
  })

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const handleReject = () => {
    setIsRejectDialogOpen(true)
  }

  const handleConfirmReject = () => {
    handleAction('reject')
    setIsRejectDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <span className="sr-only">{t('admin.bookings.actions')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">
            <div className="flex flex-col space-y-1">
              <span>{t('admin.bookings.actions')}</span>
              <span className="text-xs font-normal text-muted-foreground">Booking #{booking.id.substring(0, 8)}</span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => window.open(`/admin/bookings/${booking.id}`, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('View Details')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {/* Booking approval actions */}
            {(availableActions.canApprove || availableActions.canReject) && (
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">
                Approval Actions
              </DropdownMenuLabel>
            )}
            
            {availableActions.canApprove && (
              <DropdownMenuItem
                onClick={() => handleAction('approve')}
                disabled={isLoading}
                className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {isLoading ? t('admin.bookings.approving') : t('admin.bookings.approve')}
              </DropdownMenuItem>
            )}
            
            {availableActions.canReject && (
              <DropdownMenuItem
                onClick={handleReject}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                {isLoading ? t('admin.bookings.rejecting') : t('admin.bookings.reject')}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.bookings.rejectBooking')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {t('admin.bookings.rejectBookingConfirmation')}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmReject}>
              {t('admin.bookings.reject')}
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setIsRejectDialogOpen(false)}>
              {t('auth.Cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns: ColumnDef<BookingWithDetails>[] = [
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
    cell: ({ row }) => <ActionsCell row={row} />
  },
]