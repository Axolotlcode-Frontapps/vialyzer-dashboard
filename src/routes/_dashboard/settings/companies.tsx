import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/settings/companies')({
  component: Companies,
})

function Companies() {
  return <div>companies</div>
}
