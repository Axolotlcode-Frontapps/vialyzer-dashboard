import { DataTableColumnHeader } from '@/ui/shared/data-table/column-header'
import { RolesTableActions } from './actions'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <RolesTableActions roleId={row.original.id} />,
  },
]
