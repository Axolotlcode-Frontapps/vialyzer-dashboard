import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { TableSkeleton } from '@/ui/shared/data-table/table-skeleton'
import { columns } from './columns'

export function PermissionsTable({
  data,
  isLoading,
}: {
  data: Permission[]
  isLoading: boolean
}) {
  return (
    <>
      {!isLoading ? (
        <DataTable columns={columns} data={data}>
          {({ table }) => (
            <DataTableHeader
              table={table}
              searchBy='action'
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
