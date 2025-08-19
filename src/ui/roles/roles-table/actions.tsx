import { Button } from '@/ui/shared/button'
import { KeyRound } from 'lucide-react'
import { RoleEdit } from '../role-edit'
import { RoleDelete } from '../role-delete'

export function RolesTableActions({ role }: { role: Role }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <RoleEdit roleId={role.id} />
      <RoleDelete role={role} />

      <Button variant='secondary'>
        <KeyRound />
        Editar permisos
      </Button>
    </div>
  )
}
