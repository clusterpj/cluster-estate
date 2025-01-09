import { ColumnDef } from '@tanstack/react-table'
import { Booking } from '@/types/booking'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking ID" />
    ),
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false)
      const fullId = row.getValue('id')
      const truncatedId = `#${fullId.slice(0, 6)}...`

      const handleCopy = () => {
        navigator.clipboard.writeText(fullId)
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
                  href={`/properties/${row.getValue('property_id')}`}
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
              <p className="text-xs text-muted-foreground">{fullId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'property_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property ID" />
    ),
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false)
      const fullId = row.getValue('property_id')
      const truncatedId = `#${fullId.slice(0, 6)}...`

      const handleCopy = () => {
        navigator.clipboard.writeText(fullId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy full ID</p>
              <p className="text-xs text-muted-foreground">{fullId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'check_in',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check-in" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('check_in')), 'PPP'),
  },
  {
    accessorKey: 'check_out',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Check-out" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('check_out')), 'PPP'),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('status')}>
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
      <Badge variant={row.getValue('payment_status')}>
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
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'PPPp'),
  },
]
