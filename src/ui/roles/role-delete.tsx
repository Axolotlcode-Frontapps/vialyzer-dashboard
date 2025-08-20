import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shared/dialog'
import { LoaderCircle, Trash } from 'lucide-react'
import { Button } from '../shared/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsService } from '@/lib/services/settings'
import { useState } from 'react'

export function RoleDelete({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const roleEditMutation = useMutation({
    mutationFn: async () => {
      return await settingsService.deleteRole(role.id)
    },
    onSuccess: () => {
      toast.success(`Rol eliminado correctamente`, {
        description: `Se ha eliminado el rol "${role.name}" correctamente.`,
      })
    },
    onError: (error) => {
      toast.error(`Error al eliminar el rol "${role.name}"`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='destructive'>
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar rol</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el rol &quot;
            <span className='font-semibold capitalize'>{role.name}</span>
            &quot;?&nbsp; Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => roleEditMutation.mutate()}>
            {roleEditMutation.isPending ? (
              <>
                <LoaderCircle className='mr-2 animate-spin' />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar</span>
            )}
          </Button>
          <DialogClose>
            <Button variant='destructive'>Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
