import { toast } from 'sonner'
import { useEffect } from 'react'
import { useAppForm } from '@/contexts/form-create'
import { useMutation } from '@tanstack/react-query'
import { authServices } from '@/lib/services/auth'
import { authSchemas, type ForgotPasswordValues } from '@/lib/schemas/auth'
import { Button } from '@/ui/shared/button'
import { useNavigate } from '@tanstack/react-router'

export function ForgotPasswordForm() {
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onMount: ({ formApi }) => {
        formApi.state.canSubmit = false
        return authSchemas.forgotPassword
      },
      onChange: authSchemas.forgotPassword,
      onSubmitAsync: async ({ formApi }) => {
        formApi.state.isSubmitting = true
      },
    },
    onSubmit: ({ value }) => forgotPasswordMutation.mutate(value),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      return await authServices.forgotPassword(values)
    },
    onSuccess: () => {
      form.reset()
      toast.success(`¡Se ha enviado un correo electrónico de recuperación!`, {
        position: 'bottom-right',
        description:
          'Por favor, revisa tu correo electrónico para restablecer tu contraseña.',
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al enviar el correo electrónico de recuperación`, {
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

  useEffect(() => {
    if (forgotPasswordMutation.isPending) {
      form.state.isSubmitting = true
      form.state.canSubmit = false
    }
  }, [forgotPasswordMutation.isPending])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className='flex flex-col gap-4'>
      <form.AppField
        name='email'
        children={(field) => (
          <field.TextField
            label='Correo electrónico'
            placeholder='Correo electrónico'
          />
        )}
      />

      <form.AppForm>
        <form.SubmitButton
          label='Recuperar contraseña'
          labelLoading='Enviando...'
          className='w-full text-base h-11.5'
          size='lg'
        />
      </form.AppForm>

      <Button
        variant='link'
        onClick={() => navigate({ to: '/auth' })}
        className='w-full cursor-pointer text-muted-foreground'>
        Iniciar sesión
      </Button>
    </form>
  )
}
