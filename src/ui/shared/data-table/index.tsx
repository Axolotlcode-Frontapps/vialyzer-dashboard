import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/shared/table'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TableType,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../card'
import { getRouteApi } from '@tanstack/react-router'
import { DataTablePagination } from './pagination'
import type { GenericTableSearchValues } from '@/lib/schemas/table'
import { TableSkeleton } from './table-skeleton'

const routeApi = getRouteApi('__root__')

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  isLoading?: boolean
  data: TData[]
  children?: ({ table }: { table: TableType<TData> }) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  isLoading = false,
  data,
  children,
}: DataTableProps<TData, TValue>) {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch() as GenericTableSearchValues
  const [filters, setFilters] = useState({
    page: (search.page || 1) - 1,
    limit: search.limit || 10,
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newPaginationState =
        typeof updater === 'function'
          ? updater({ pageIndex: filters.page, pageSize: filters.limit })
          : updater

      if (search.limit && search.page) {
        navigate({
          search: {
            ...search,
            page: newPaginationState.pageIndex + 1,
            limit: newPaginationState.pageSize,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })
      }

      setFilters({
        page: newPaginationState.pageIndex,
        limit: newPaginationState.pageSize,
      })
    },
    state: {
      pagination: {
        pageIndex: filters.page,
        pageSize: filters.limit,
      },
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <Card>
      {children ? <CardHeader>{children({ table })}</CardHeader> : null}
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'>
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <DataTablePagination table={table} />
      </CardFooter>
    </Card>
  )
}
