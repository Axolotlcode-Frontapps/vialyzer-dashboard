import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'
import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { columns } from './columns'
import { TableSkeleton } from '@/ui/shared/data-table/table-skeleton'

export function RolesTable() {
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => settingsService.getAllRoles(),
  })

  const roles = useMemo(() => rolesData?.payload ?? [], [rolesData])

  return (
    <>
      {!isLoading ? (
        <DataTable columns={columns} data={roles}>
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
