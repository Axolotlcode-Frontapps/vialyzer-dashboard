import { ForgotPasswordForm } from '@/ui/auth/forgot-password-form'
import logo from '@/assets/images/vialyzer_logo_powered.svg'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shared/card'
import { createFileRoute } from '@tanstack/react-router'
import { cn } from '@/utils'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  return (
    <Card className='w-full max-w-[500px] bg-[#05225E]/70 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border'>
      <CardHeader className='!px-0'>
        <img
          src={logo}
          alt='Vialyzer'
          className={cn('w-32 md:w-40 h-16 md:h-20 object-contain mx-auto')}
        />
        <CardTitle className='text-xl md:text-2xl text-white text-center'>
          Recuperar contraseña
        </CardTitle>
        <CardDescription className='md:text-base  text-center'>
          Ingresa tu correo electrónico a continuación para recuperar tu
          contraseña
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
