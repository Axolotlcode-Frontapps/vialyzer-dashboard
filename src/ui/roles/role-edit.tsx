import { useAppForm } from '@/contexts/form-create'
import { Button } from '@/ui/shared/button'
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
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RoleFields } from './role-fields'
import { roleFieldsOpts } from './role-fields/options'
import { settingsService } from '@/lib/services/settings'
import type { RoleValues } from '@/lib/schemas/settings'
import { Pencil } from 'lucide-react'
import { useState } from 'react'

export function RoleEdit({ roleId }: { roleId: string }) {
  const [open, onOpenChange] = useState(false)

  const roleEditMutation = useMutation({
    mutationFn: async (values: RoleValues) => {
      return await settingsService.updateRole(roleId, values)
    },
    onSuccess: ({ payload }) => {
      form.reset()
      toast.success(`Rol actualizado correctamente`, {
        description: `Se ha actualizado el rol "${payload?.name}" correctamente.`,
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al actualizar el rol`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      form.state.isSubmitting = false
    },
  })

  const form = useAppForm({
    ...roleFieldsOpts,
    onSubmit: ({ value }) => roleEditMutation.mutate(value),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button size='icon'>
          <Pencil />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:min-w-[600px]'>
        <SheetHeader>
          <SheetTitle>Editar rol</SheetTitle>
          <SheetDescription>
            Vas a modificar la información de este rol. Realiza los cambios
            necesarios y guarda para actualizar el rol.
          </SheetDescription>
        </SheetHeader>
        <form
          id='role-edit-form'
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
              form='role-edit-form'
              label='Actualizar rol'
              labelLoading='Actualizando rol...'
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
