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
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/verify-code')({
  component: VerifyCode,
})

function VerifyCode() {
  const navigate = useNavigate()

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Verificar código</CardTitle>
        <CardDescription>
          Introduce el código de verificación que te hemos enviado por correo
          electrónico para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InputOTP maxLength={6}>
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

        <Button className='w-full cursor-pointer mt-6 h-11'>
          Verificar código
        </Button>

        <Button
          variant='link'
          onClick={() => navigate({ to: '/auth' })}
          className='w-full cursor-pointer text-muted-foreground mt-4'>
          Iniciar sesión
        </Button>
      </CardContent>
    </Card>
  )
}
