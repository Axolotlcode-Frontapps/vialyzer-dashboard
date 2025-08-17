import { useAppForm } from '@/contexts/form-create'
import { authSchemas, type UpdatePasswordValues } from '@/lib/schemas/auth'
import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'

import { toast } from 'sonner'

export function UpdatePasswordForm() {
  const form = useAppForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onMount: ({ formApi }) => {
        formApi.state.canSubmit = false
        return authSchemas.updatePassword
      },
      onChange: authSchemas.updatePassword,
      onSubmitAsync: async ({ formApi }) => {
        formApi.state.isSubmitting = true
      },
    },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  const loginMutation = useMutation({
    mutationFn: async (values: UpdatePasswordValues) => {
      // const data = await authServices.signIn(values)
      console.log(values)
    },
    onSuccess: () => {
      form.reset()
      toast.success(`¡Contraseña actualizada!`, {
        position: 'bottom-right',
        description: 'Tu contraseña ha sido actualizada correctamente.',
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al actualizar la contraseña`, {
        description:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al actualizar la contraseña.',
      })
    },
    onSettled: () => {
      form.state.isSubmitting = false
    },
  })

  useEffect(() => {
    if (loginMutation.isPending) {
      form.state.isSubmitting = true
      form.state.canSubmit = false
    }
  }, [loginMutation.isPending])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className='flex flex-col gap-4'>
      <form.AppField
        name='password'
        children={(field) => (
          <field.PasswordField label='Contraseña' placeholder='Contraseña' />
        )}
      />

      <form.AppField
        name='confirmPassword'
        children={(field) => (
          <field.PasswordField
            label='Confirmar contraseña'
            placeholder='Confirmar contraseña'
          />
        )}
      />

      <form.AppForm>
        <form.SubmitButton
          label='Actualizar'
          labelLoading='Actualizando...'
          className='w-full text-base h-11.5'
          size='lg'
        />
      </form.AppForm>
    </form>
  )
}
