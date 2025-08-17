import { useAppForm } from '@/contexts/form-create'
import { authSchemas, type SignInValues } from '@/lib/schemas/auth'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-provider'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { authServices } from '@/lib/services/auth'
import { toast } from 'sonner'
import { Button } from '@/ui/shared/button'

export function SignInForm() {
  const auth = useAuth()
  const router = useRouter()
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validators: {
      onMount: ({ formApi }) => {
        formApi.state.canSubmit = false
        return authSchemas.signIn
      },
      onChange: authSchemas.signIn,
      onSubmitAsync: async ({ formApi }) => {
        formApi.state.isSubmitting = true
      },
    },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  const loginMutation = useMutation({
    mutationFn: async (values: SignInValues) => {
      const data = await authServices.signIn(values)

      if (!data.payload?.token) return

      await auth.login(data.payload.token)
      await router.invalidate()
      await navigate({ to: '/' })
    },
    onSuccess: () => {
      form.reset()
      toast.success(`¡Bienvenido de nuevo!`, {
        position: 'bottom-right',
        description: 'Has iniciado sesión correctamente.',
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Inicio de sesión fallido`, {
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
        name='email'
        children={(field) => (
          <field.TextField
            label='Correo electrónico'
            placeholder='Correo electrónico'
          />
        )}
      />
      <form.AppField
        name='password'
        children={(field) => (
          <field.PasswordField label='Contraseña' placeholder='Contraseña' />
        )}
      />

      <div className='flex items-center justify-between gap-2'>
        <form.AppField
          name='rememberMe'
          children={(field) => <field.Switchfield label='Recordar sesión' />}
        />

        <Button
          variant='link'
          onClick={() => navigate({ to: '/auth/forgot-password' })}
          className='cursor-pointer text-muted-foreground p-0'>
          ¿Olvidaste tu contraseña?
        </Button>
      </div>
      <form.AppForm>
        <form.SubmitButton
          label='Iniciar sesión'
          labelLoading='Iniciando sesión...'
          className='w-full text-base h-11.5'
          size='lg'
        />
      </form.AppForm>
    </form>
  )
}
