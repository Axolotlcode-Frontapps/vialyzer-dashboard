import { DataTable } from '@/ui/shared/data-table'
import { DataTableHeader } from '@/ui/shared/data-table/table-header'
import { columns, type FakeTable } from './columns'

export function InitialTable() {
  const data: FakeTable[] = [
    {
      id: 1,
      name: 'Luis',
      email: 'luis@example.com',
    },
    {
      id: 2,
      name: 'Maria',
      email: 'maria@example.com',
    },
    {
      id: 3,
      name: 'John',
      email: 'john@example.com',
    },
    {
      id: 4,
      name: 'Ana',
      email: 'ana@example.com',
    },
    {
      id: 5,
      name: 'Carlos',
      email: 'carlos@example.com',
    },
    {
      id: 6,
      name: 'Sofia',
      email: 'sofia@example.com',
    },
    {
      id: 7,
      name: 'David',
      email: 'david@example.com',
    },
    {
      id: 8,
      name: 'Elena',
      email: 'elena@example.com',
    },
    {
      id: 9,
      name: 'Miguel',
      email: 'miguel@example.com',
    },
    {
      id: 10,
      name: 'Lucia',
      email: 'lucia@example.com',
    },
    {
      id: 11,
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  ]

  return (
    <div className='space-y-4'>
      <h2 className='text-xl lg:text-2xl font-medium'>Example table</h2>

      <DataTable columns={columns} data={data}>
        {({ table }) => (
          <DataTableHeader
            table={table}
            searchBy='name'
            searchPlaceholder='Buscar clientes potenciales no asignados...'
          />
        )}
      </DataTable>
    </div>
  )
}
