import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/mobility/')({
  component: Mobility,
})

function Mobility() {
  return <div>Mobility!</div>
}
