import { SignInForm } from '@/ui/auth/sign-in-form'
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
import {
  Decoration,
  DecorationBlock,
  DecorationBottom,
  DecorationTitle,
  DecorationTop,
} from '@/ui/auth/sign-in-decoration'

export const Route = createFileRoute('/auth/')({
  component: SignIn,
})

function SignIn() {
  return (
    <>
      <Card className='w-full max-w-[500px] bg-[#05225E]/70 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border'>
        <CardHeader>
          <img
            src={logo}
            alt='Vialyzer'
            className={cn('w-32 md:w-40 h-16 md:h-20 object-contain mx-auto')}
          />
          <CardTitle className='text-xl md:text-2xl text-white text-center'>
            Bienvenido a Vialyzer
          </CardTitle>
          <CardDescription className='md:text-base  text-center'>
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
