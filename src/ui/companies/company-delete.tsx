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
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsService } from '@/lib/services/settings'

export function CompanyDelete({ company }: { company: Company }) {
  const companyDeleteMutation = useMutation({
    mutationFn: async () => {
      return await settingsService.deleteCompany(company.id)
    },
    onSuccess: () => {
      toast.success(`Empresa eliminada correctamente`, {
        description: `Se ha eliminado la empresa "${company.name}" correctamente.`,
      })
    },
    onError: (error) => {
      toast.error(`Error al eliminar la empresa "${company.name}"`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='icon' variant='destructive'>
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar rol</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la empresa &quot;
            <span className='font-semibold capitalize'>{company.name}</span>
            &quot;?&nbsp; Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => companyDeleteMutation.mutate()}>
            {companyDeleteMutation.isPending ? (
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
