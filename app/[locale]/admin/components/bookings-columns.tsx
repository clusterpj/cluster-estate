import { ColumnDef } from '@tanstack/react-table'
import { Booking } from '@/types/booking'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/ui/data-table-column-header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking ID" />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-mono">#{row.getValue('id').slice(0, 6)}...</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('id')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: 'property_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property ID" />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-mono">#{row.getValue('property_id').slice(0, 6)}...</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('property_id')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
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
