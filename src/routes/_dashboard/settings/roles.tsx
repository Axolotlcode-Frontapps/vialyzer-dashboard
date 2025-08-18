import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/settings/roles')({
  component: Roles,
})

function Roles() {
  return <div>roles</div>
}
