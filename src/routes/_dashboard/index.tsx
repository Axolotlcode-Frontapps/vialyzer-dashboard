import { genericTableSearchSchema } from '@/lib/schemas/table'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'

import { InitialTable } from '@/ui/home/initial-table'

export const Route = createFileRoute('/_dashboard/')({
  component: Home,
  validateSearch: zodValidator(genericTableSearchSchema),
})

function Home() {
  return (
    <>
      <InitialTable />
    </>
  )
}
