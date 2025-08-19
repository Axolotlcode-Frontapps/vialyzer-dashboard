import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/mobility/security')({
  component: Security,
})

function Security() {
  return <div>security</div>
}
