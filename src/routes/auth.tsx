import { ModeToggle } from '@/ui/shared/mode-toggle'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },

  component: AuthLayout,
})

export default function AuthLayout() {
  return (
    <main className='h-screen w-full flex flex-col lg:flex-row'>
      <div className='flex min-h-dvh w-full items-center justify-center p-6 md:p-10'>
        <Outlet />
      </div>
      <div className='absolute top-4 right-4'>
        <ModeToggle />
      </div>
    </main>
  )
}
