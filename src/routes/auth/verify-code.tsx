import { Button } from '@/ui/shared/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shared/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/ui/shared/input-otp'
import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/contexts/form-create'
import { authSchemas, type VerifyCodeValues } from '@/lib/schemas/auth'
import { useMutation } from '@tanstack/react-query'
import { authServices } from '@/lib/services/auth'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useState } from 'react'
import { LogoVialyzer } from '@/ui/shared/logo-vialyzer'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/verify-code')({
  component: VerifyCode,
  validateSearch: zodValidator(authSchemas.verifyCodeQueries),
})

function VerifyCode() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const [persistedParams, setPersistedParams] = useState({
    userId: search.userId || null,
    token: search.token || null,
  })

  useEffect(() => {
    if (search.userId && search.token) {
      setPersistedParams((prev) => ({
        userId: search.userId || prev.userId,
        token: search.token || prev.token,
      }))

      navigate({
        search: undefined,
      })
    }
  }, [search])

  const mutation = useMutation({
    mutationFn: async (values: VerifyCodeValues) => {
      const response = await authServices.verifyCode(
        values,
        persistedParams.userId!,
        persistedParams.token!
      )

      return { ...response }
    },
    onSuccess: ({ id, token }) => {
      toast.success(`¡Se ha verificado tu código!`, {
        position: 'bottom-right',
        description: 'Ahora puedes actualizar tu contraseña.',
      })
      form.reset()
      navigate({
        to: '/auth/update-password',
        search: {
          userId: id,
          token,
        },
      })
    },
    onError: (error) => {
      toast.error(`Error al verificar el código`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
  })

  const form = useAppForm({
    defaultValues: {
      code: '',
    },
    validators: {
      onChange: authSchemas.verifyCode,
    },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  return (
    <Card className='w-full max-w-[500px] dark:bg-[#05225E]/80 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border'>
      <CardHeader className='!px-0'>
        <a
          href='/auth'
          className='cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out mx-auto'>
          <LogoVialyzer className='mb-6' />
        </a>
        <CardTitle className='text-xl md:text-2xl text-center'>
          Verificar código
        </CardTitle>
        <CardDescription>
          Introduce el código de verificación que te hemos enviado por correo
          electrónico para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className='h-fit px-0'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <form.AppField
            name='code'
            children={(field) => (
              <InputOTP
                maxLength={6}
                value={field.state.value}
                onChange={field.handleChange}>
                <InputOTPGroup className='w-full'>
                  <InputOTPSlot className='w-full' index={0} />
                  <InputOTPSlot className='w-full' index={1} />
                  <InputOTPSlot className='w-full' index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className='w-full'>
                  <InputOTPSlot className='w-full' index={3} />
                  <InputOTPSlot className='w-full' index={4} />
                  <InputOTPSlot className='w-full' index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />

          <form.AppForm>
            <form.SubmitButton
              label='Verificar código'
              labelLoading='Verificando...'
              className='w-full text-base h-11.5 mt-6'
              size='lg'
            />
          </form.AppForm>
        </form>

        <Button
          variant='link'
          // onClick={() => navigate({ to: '/auth' })}
          className='w-full cursor-pointer text-muted-foreground mt-4'>
          Iniciar sesión
        </Button>
      </CardContent>
    </Card>
  )
}
