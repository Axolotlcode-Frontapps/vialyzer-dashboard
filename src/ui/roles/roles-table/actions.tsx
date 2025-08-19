import { buttonVariants } from '@/ui/shared/button'
import { KeyRound } from 'lucide-react'
import { RoleUpdate } from '../role-update'
import { RoleDelete } from '../role-delete'
import { Link } from '@tanstack/react-router'

export function RoleTableActions({ role }: { role: Role }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <RoleUpdate role={role} />
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
