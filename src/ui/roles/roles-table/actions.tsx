import { Button } from '@/ui/shared/button'
import { KeyRound, Pencil, Trash } from 'lucide-react'
import { RoleEdit } from '../role-edit'
import { useState } from 'react'

export function RolesTableActions({ roleId }: { roleId: string }) {
  const [openEdit, setOpenEdit] = useState(false)

  return (
    <>
      <div className='flex items-center justify-end gap-2'>
        <Button size='icon' onClick={() => setOpenEdit(true)}>
          <Pencil />
        </Button>
        <Button size='icon' variant='destructive'>
          <Trash />
        </Button>
        <Button variant='secondary'>
          <KeyRound />
          Editar permisos
        </Button>
      </div>

      <RoleEdit open={openEdit} onOpenChange={setOpenEdit} roleId={roleId} />
    </>
  )
}
