import { RolesTable } from '@/ui/roles/roles-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/settings/roles')({
  component: Roles,
})

function Roles() {
  return <RolesTable />
}
