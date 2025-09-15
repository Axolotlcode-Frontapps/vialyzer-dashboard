import { useAppForm } from '@/contexts/form'
import { Button } from '@/ui/shared/button'
import type { RoleValues } from '@/lib/schemas/settings'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/shared/sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { RoleFields } from './role-fields'
import { roleFieldsOpts } from './role-fields/options'
import { settingsService } from '@/lib/services/settings'
import { CirclePlus } from 'lucide-react'

export function RoleAdd() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const roleAddMutation = useMutation({
    mutationFn: async (values: RoleValues) => {
      return await settingsService.createRole(values)
    },
    onSuccess: ({ payload }) => {
      form.reset()
      toast.success(`Rol creado correctamente`, {
        description: `Se ha creado el rol "${payload?.name}" correctamente.`,
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al crear el rol`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      form.state.isSubmitting = false
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...roleFieldsOpts,
    onSubmit: ({ value }) => roleAddMutation.mutate(value),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <CirclePlus />
          <span className='hidden sm:inline'>Crear rol</span>
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:min-w-[600px]'>
        <SheetHeader>
          <SheetTitle>Crear rol</SheetTitle>
          <SheetDescription>
            Vas a crear un nuevo rol. Completa la información necesaria y guarda
            para agregar el rol.
          </SheetDescription>
        </SheetHeader>
        <form
          id='role-add-form'
          className='px-4 space-y-2'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <RoleFields form={form} />
        </form>
        <SheetFooter>
          <form.AppForm>
            <form.SubmitButton
              form='role-add-form'
              label='Crear rol'
              labelLoading='Creando rol...'
            />
          </form.AppForm>
          <SheetClose asChild>
            <Button variant='destructive'>Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
