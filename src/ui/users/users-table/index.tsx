import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { TableSkeleton } from '@/ui/shared/data-table/table-skeleton'
import { columns } from './columns'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'

export function UsersTable() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => settingsService.getAllUsers(),
  })

  const users = useMemo(() => usersData?.payload ?? [], [usersData])

  return (
    <>
      {!isLoading ? (
        <DataTable columns={columns} data={users}>
          {({ table }) => (
            <DataTableHeader
              table={table}
              searchBy='name'
              searchPlaceholder='Busqueda por nombre'
            />
          )}
        </DataTable>
      ) : (
        <TableSkeleton />
      )}
    </>
  )
}
