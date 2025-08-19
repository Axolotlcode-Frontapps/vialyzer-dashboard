import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/mobility/forecast')({
  component: Forecast,
})

function Forecast() {
  return <div>forecast</div>
}
