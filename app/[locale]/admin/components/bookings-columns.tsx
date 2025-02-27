'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Check, Copy, Mail, User, MoreHorizontal } from 'lucide-react'
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

// Create a context for sharing hooks
import { createContext, useContext } from 'react'
import type { toast as ToastFunction } from '@/hooks/use-toast'

// Define the types for booking status
type BookingStatus = 'pending' | 'confirmed' | 'expired' | 'canceled' | 'payment_failed' | 'awaiting_approval';

type BookingHooksContextType = {
  t: ReturnType<typeof useTranslations>;
  toast: {
    toast: typeof ToastFunction;
    dismiss: (toastId?: string) => void;
  };
  queryClient: ReturnType<typeof useQueryClient>;
};

const BookingHooksContext = createContext<BookingHooksContextType | null>(null);

// Provider component for the table
export function BookingsColumnProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const toastUtils = useToast();
  const queryClient = useQueryClient();
  
  return (
    <BookingHooksContext.Provider value={{ t, toast: toastUtils, queryClient }}>
      {children}
    </BookingHooksContext.Provider>
  );
}

// Hook to use the context
function useBookingHooks() {
  const context = useContext(BookingHooksContext);
  if (!context) {
    throw new Error('useBookingHooks must be used within a BookingsColumnProvider');
  }
  return context;
}

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
    authorizationId?: string
    payerID?: string
    orderID?: string
    status?: string
  },
  status: BookingStatus // Define the status with our type
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

// Payment Status Badge component to avoid hooks in cell render function
const PaymentStatusBadge = ({ status, details }: { status: string, details?: BookingWithDetails['payment_details'] }) => {
  const { t } = useBookingHooks();
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  switch (status) {
    case 'completed':
      variant = 'default';
      break;
    case 'failed':
      variant = 'destructive';
      break;
    case 'authorized':
      variant = 'secondary';
      break;
    default:
      variant = 'outline';
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={variant} className="capitalize">
            {t(`bookings.payment_status.${status}`)}
          </Badge>
        </TooltipTrigger>
        {details && (
          <TooltipContent>
            <div className="space-y-1">
              {details.orderID && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Order ID:</span>
                  <span className="text-sm">{details.orderID}</span>
                </div>
              )}
              {details.authorizationId && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Auth ID:</span>
                  <span className="text-sm">{details.authorizationId}</span>
                </div>
              )}
              {details.payerID && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Payer ID:</span>
                  <span className="text-sm">{details.payerID}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

// Actions cell component to avoid hooks in cell render function
const BookingActionsCell = ({ booking }: { booking: BookingWithDetails }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t, toast, queryClient } = useBookingHooks();

  const handleAction = async (action: 'approve' | 'reject' | 'capture' | 'mark_completed' | 'mark_failed' | 'mark_pending') => {
    try {
      setIsLoading(true);
      let endpoint = '';
      let payload: Record<string, unknown> = {}; // Use unknown instead of any

      switch (action) {
        case 'capture':
          endpoint = '/api/admin/capture-payment';
          payload = {
            bookingId: booking.id,
            authorizationId: booking.payment_details?.authorizationId
          };
          break;
        case 'approve':
        case 'reject':
          endpoint = '/api/admin/approve-booking';
          payload = {
            bookingId: booking.id,
            approved: action === 'approve',
            reason: action === 'approve' ? 'Admin approved' : 'Admin rejected'
          };
          break;
        case 'mark_completed':
          if (booking.payment_status === 'authorized' && booking.payment_details?.orderID) {
            endpoint = '/api/admin/capture-payment';
            payload = {
              bookingId: booking.id,
              orderId: booking.payment_details.orderID
            };
          } else {
            endpoint = '/api/admin/update-payment-status';
            payload = {
              bookingId: booking.id,
              status: 'completed'
            };
          }
          break;
        case 'mark_failed':
        case 'mark_pending':
          endpoint = '/api/admin/update-payment-status';
          payload = {
            bookingId: booking.id,
            status: action === 'mark_failed' ? 'failed' : 'pending'
          };
          break;
      }

      console.log('Sending request to:', endpoint, 'with payload:', payload);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      toast.toast({
        title: t('Success'),
        description: action === 'mark_completed' && 'orderId' in payload
          ? t('admin.bookings.paymentCaptured')
          : t('admin.bookings.statusUpdated'),
        variant: 'default',
      });

      // Refresh the data without page reload
      await queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    } catch (error) {
      console.error('Error:', error);
      toast.toast({
        title: t('Error'),
        description: error instanceof Error 
          ? t(`admin.bookings.errors.${error.message.toLowerCase()}`) || t('admin.bookings.errors.updateError')
          : t('admin.bookings.errors.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showPaymentActions = booking.status === 'confirmed';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('admin.bookings.actions')}</DropdownMenuLabel>
        
        {/* Booking Status Actions */}
               {booking.status === ('awaiting_approval' as BookingStatus) && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction('approve')}
              disabled={isLoading}
            >
              {isLoading ? t('admin.bookings.approving') : t('admin.bookings.approve')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction('reject')}
              disabled={isLoading}
              className="text-red-600"
            >
              {isLoading ? t('admin.bookings.rejecting') : t('admin.bookings.reject')}
            </DropdownMenuItem>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('admin.bookings.approvalNote')}
            </DropdownMenuLabel>
          </>
        )}

        {/* Payment Status Actions - Only shown for confirmed bookings */}
        {showPaymentActions && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('admin.bookings.updatePaymentStatus')}</DropdownMenuLabel>
            
            {booking.payment_status !== 'completed' && (
              <DropdownMenuItem
                onClick={() => handleAction('mark_completed')}
                disabled={isLoading}
              >
                {isLoading ? t('admin.bookings.updating') : t('admin.bookings.markCompleted')}
              </DropdownMenuItem>
            )}
            
            {booking.payment_status !== 'failed' && (
              <DropdownMenuItem
                onClick={() => handleAction('mark_failed')}
                disabled={isLoading}
                className="text-red-600"
              >
                {isLoading ? t('admin.bookings.updating') : t('admin.bookings.markFailed')}
              </DropdownMenuItem>
            )}
            
            {booking.payment_status !== 'pending' && (
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
  );
};

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
      const status = row.getValue('status') as string
      const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        canceled: 'bg-red-100 text-red-800',
        awaiting_approval: 'bg-blue-100 text-blue-800',
        completed: 'bg-gray-100 text-gray-800'
      }

      return (
        <Badge className={colors[status] || 'bg-gray-100'}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
      // This no longer uses hooks directly
      return (
        <PaymentStatusBadge 
          status={row.getValue('payment_status') as string} 
          details={row.original.payment_details}
        />
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
      return <BookingActionsCell booking={row.original} />
    }
  },
]
