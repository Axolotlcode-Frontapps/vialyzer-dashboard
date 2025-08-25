import { ForgotPasswordForm } from '@/ui/auth/forgot-password-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/ui/shared/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  return (
    <Card className='w-full max-w-[500px] bg-[#05225E]/70 rounded-xl shadow-2xl p-6 md:p-10 relative'>
      <CardHeader>
        <CardIcon />
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico a continuación para recuperar tu
          contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
