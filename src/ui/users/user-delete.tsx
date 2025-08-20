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

export function UserDelete({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const userDeleteMutation = useMutation({
    mutationFn: async () => {
      return await settingsService.deleteUser(user.id)
    },
    onSuccess: () => {
      toast.success(`Usuario eliminado correctamente`, {
        description: `Se ha eliminado el usuario "${user.name}" correctamente.`,
      })
    },
    onError: (error) => {
      toast.error(`Error al eliminar el usuario "${user.name}"`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el usuario &quot;
            <span className='font-semibold capitalize'>{user.name}</span>
            &quot;?&nbsp; Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => userDeleteMutation.mutate()}>
            {userDeleteMutation.isPending ? (
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
