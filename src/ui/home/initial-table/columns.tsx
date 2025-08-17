import { Checkbox } from '@/ui/shared/checkbox'
import { DataTableColumnHeader } from '@/ui/shared/data-table/column-header'
import { ExampleActions } from './actions'
import type { ColumnDef } from '@tanstack/react-table'

export interface FakeTable {
  id: number
  name: string
  email: string
}

export const columns: ColumnDef<FakeTable>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
  },
  {
    id: 'actions',
    cell: () => <ExampleActions />,
  },
]
