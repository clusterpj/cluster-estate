'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Check, Copy, ExternalLink, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'

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
      const status = row.getValue('status') as string
      let variant: 'default' | 'destructive' | 'warning' | 'outline'

      switch (status) {
        case 'confirmed':
          variant = 'default'
          break
        case 'canceled':
        case 'payment_failed':
          variant = 'destructive'
          break
        case 'pending':
          variant = 'warning'
          break
        default:
          variant = 'outline'
      }

      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('payment_status') as string
      let variant: 'default' | 'destructive' | 'warning' | 'outline'

      switch (status) {
        case 'completed':
          variant = 'default'
          break
        case 'failed':
          variant = 'destructive'
          break
        case 'pending':
          variant = 'warning'
          break
        default:
          variant = 'outline'
      }

      return <Badge variant={variant}>{status}</Badge>
    },
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
]
