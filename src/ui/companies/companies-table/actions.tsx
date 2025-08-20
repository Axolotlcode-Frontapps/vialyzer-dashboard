import { CompanyDelete } from '@/ui/companies/company-delete'
import { CompanyUpdate } from '@/ui/companies/company-update'

export function CompanyTableActions({ company }: { company: Company }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <CompanyUpdate company={company} />
      <CompanyDelete company={company} />
    </div>
  )
}
