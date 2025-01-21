'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Booking } from '@/types/booking'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

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
            <Link 
              href={`/properties/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-accent rounded-md"
              title="View property"
            >
              <ExternalLink className="h-4 w-4 opacity-50 hover:opacity-100" />
            </Link>
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

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking ID" />
    ),
    cell: ({ row }) => <IdCell id={row.getValue('id')} />,
  },
  {
    accessorKey: 'property_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property ID" />
    ),
    cell: ({ row }) => <IdCell id={row.getValue('property_id')} />,
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
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'confirmed' ? 'default' : 'destructive'}>
        {row.getValue('status')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('payment_status') === 'completed' ? 'default' : 'destructive'}>
        {row.getValue('payment_status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'total_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Price" />
    ),
    cell: ({ row }) => `$${row.getValue('total_price')}`,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM d, h:mm a'),
  },
]
