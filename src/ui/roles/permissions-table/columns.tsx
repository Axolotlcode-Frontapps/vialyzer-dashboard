import { DataTableColumnHeader } from '@/ui/shared/data-table/column-header'
import { Switch } from '@/ui/shared/switch'
import { rolesTranslate } from '@/utils/roles-translate'

import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Permission>[] = [
  {
    accessorKey: 'module',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Módulo' />
    ),
    cell: ({ row }) => (
      <div className='capitalize'>
        {rolesTranslate[row.getValue('module') as string]}
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acción' />
    ),
    cell: ({ row }) => (
      <div className='capitalize'>{row.getValue('action')}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
  },
  {
    accessorKey: 'active',
    header: () => <span>Activo</span>,
    cell: ({ row }) => <Switch checked={row.original.active} />,
  },
]
