import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { TableSkeleton } from '@/ui/shared/data-table/table-skeleton'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'
import { columns } from './columns'

export function CompaniesTable() {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => settingsService.getAllCompanies(),
  })

  const companies = useMemo(() => companiesData?.payload ?? [], [companiesData])

  return (
    <>
      {!isLoading ? (
        <DataTable columns={columns} data={companies}>
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
