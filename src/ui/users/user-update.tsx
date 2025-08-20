import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
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
import { userFieldsOpts } from './user-fields/options'
import { UserFields } from './user-fields'
import type { UserValues } from '@/lib/schemas/settings'
import { settingsService } from '@/lib/services/settings'

export function UserUpdate({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const userUpdateMutation = useMutation({
    mutationFn: async (values: UserValues) => {
      return await settingsService.updateUser(user.id, values)
    },
    onSuccess: () => {
      form.reset()
      toast.success(`Usuario actualizado correctamente`, {
        description: `Se ha actualizado el usuario "${user?.name}" correctamente.`,
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al actualizar el usuario`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      form.state.isSubmitting = false
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...userFieldsOpts,
    defaultValues: {
      name: user.name ?? '',
      lastname: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role.id ?? '',
      company: user.companie.id ?? '',
    },
    onSubmit: ({ value }) => userUpdateMutation.mutate(value as UserValues),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Pencil />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:min-w-[600px]'>
        <SheetHeader>
          <SheetTitle>Actualizar usuario</SheetTitle>
          <SheetDescription>
            Vas a actualizar un usuario existente. Completa la información
            necesaria y guarda para aplicar los cambios.
          </SheetDescription>
        </SheetHeader>
        <form
          id='user-edit-form'
          className='px-4 space-y-2'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <UserFields form={form} />
        </form>
        <SheetFooter>
          <form.AppForm>
            <form.SubmitButton
              form='user-edit-form'
              label='Actualizar usuario'
              labelLoading='Actualizando usuario...'
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
