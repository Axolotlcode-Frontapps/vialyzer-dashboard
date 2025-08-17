import { Button } from '@/ui/shared/button'
import {
  DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/shared/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
// import { useState } from 'react'

export function ExampleActions() {
  // const [openAssign, setOpenAssign] = useState(false)
  // const [openReassign, setOpenReassign] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0 float-right cursor-pointer'>
            <span className='sr-only'>Abrir menú de acciones</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        {/* <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenAssign(true)}>
            Asignar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenReassign(true)}>
            Reasignar
          </DropdownMenuItem>
        </DropdownMenuContent> */}
      </DropdownMenu>
      {/* {openAssign && (
        <AssignAgent
          title='Asignación de agente'
          description='Selecciona el agente para asignar al lead'
          open={openAssign}
          onOpenChange={setOpenAssign}
        />
      )}

      {openReassign && (
        <AssignAgent
          title='Reasignación de agente'
          description='Selecciona el nuevo agente para reasignar al lead'
          open={openReassign}
          onOpenChange={setOpenReassign}
        />
      )} */}
    </>
  )
}
