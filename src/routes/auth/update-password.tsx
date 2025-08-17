import { UpdatePasswordForm } from '@/ui/auth/update-password-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shared/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/update-password')({
  component: UpdatePassword,
})

function UpdatePassword() {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Actualizar contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para actualizarla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  )
}
