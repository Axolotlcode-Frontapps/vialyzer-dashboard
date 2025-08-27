import { SignInForm } from '@/ui/auth/sign-in-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/ui/shared/card'
import {
  Decoration,
  DecorationBlock,
  DecorationBottom,
  DecorationTitle,
  DecorationTop,
} from '@/ui/shared/sign-in-decoration'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: SignIn,
})

function SignIn() {
  return (
    <>
      <Card className='w-full max-w-[500px] bg-[#05225E]/70 rounded-xl shadow-2xl p-6 md:p-10 relative'>
        <CardHeader className='h-fit'>
          <CardIcon />
          <CardTitle>Bienvenido a Vialyzer</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className='h-fit'>
          <SignInForm />
        </CardContent>
      </Card>

      <Decoration className='relative mt-35 2xl:mt-55 '>
        <DecorationTop>
          <DecorationBlock className='bg-[#1352ED]' />
          <DecorationBlock className='bg-[#FC4B5F]' />
          <DecorationBlock className='bg-white ml-100 md:ml-50' />
        </DecorationTop>
        <div className='text-white space-y-4'>
          <DecorationTitle className='md:text-left'>
            Actores viales
          </DecorationTitle>
          <DecorationTitle className='font-bold md:text-right md:pl-10'>
            mejor perfilados
          </DecorationTitle>
        </div>
        <DecorationBottom>
          <DecorationBlock className='bg-[#1352ED]' />
          <div className='flex flex-col gap-4'>
            <DecorationBlock className='bg-[#FC4B5F]' />
            <DecorationBlock className='bg-white' />
          </div>
        </DecorationBottom>
      </Decoration>
    </>
  )
}
