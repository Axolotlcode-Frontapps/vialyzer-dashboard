import { AppSidebar } from '@/ui/shared/layout/app-side'
import { Header } from '@/ui/shared/header'
import { SidebarInset, SidebarProvider } from '@/ui/shared/sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth',
        replace: true,
      })
    }
  },
  component: PrivateLayout,
})

function PrivateLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className='min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-108px)] flex flex-col pt-4 pb-5 md:pb-8 px-5 md:px-8'>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
