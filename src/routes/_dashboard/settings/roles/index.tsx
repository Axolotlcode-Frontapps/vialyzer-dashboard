import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { genericTableSearchSchema } from '@/lib/schemas/table'
import { RolesTable } from '@/ui/roles/roles-table'
import { RoleAdd } from '@/ui/roles/role-add'

export const Route = createFileRoute('/_dashboard/settings/roles/')({
  component: Roles,
  validateSearch: zodValidator(genericTableSearchSchema),
})

function Roles() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <h2 className='text-xl lg:text-2xl font-medium'>Roles</h2>
        <RoleAdd />
      </div>

      <RolesTable />
    </div>
  )
}
