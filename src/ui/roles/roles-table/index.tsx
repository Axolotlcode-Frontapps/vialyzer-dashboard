import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'
import { RoleAdd } from '../role-add'

export function RolesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => settingsService.getAllRoles(),
    select: (data) => data?.payload,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No data found</div>
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl lg:text-2xl font-medium'>Example table</h2>

      <DataTable columns={columns} data={data}>
        {({ table }) => (
          <DataTableHeader
            table={table}
            searchBy='name'
            searchPlaceholder='Busqueda por nombre'>
            <RoleAdd />
          </DataTableHeader>
        )}
      </DataTable>
    </div>
  )
}
