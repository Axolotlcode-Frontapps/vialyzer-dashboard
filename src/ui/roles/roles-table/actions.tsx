import { buttonVariants } from '@/ui/shared/button'
import { KeyRound } from 'lucide-react'
import { RoleEdit } from '../role-edit'
import { RoleDelete } from '../role-delete'
import { Link } from '@tanstack/react-router'

export function RolesTableActions({ role }: { role: Role }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <RoleEdit roleId={role.id} />
      <RoleDelete role={role} />

      <Link
        to='/settings/roles/$roleId'
        params={{ roleId: role.id }}
        className={buttonVariants({
          variant: 'secondary',
        })}>
        <KeyRound />
        Editar permisos
      </Link>
    </div>
  )
}
