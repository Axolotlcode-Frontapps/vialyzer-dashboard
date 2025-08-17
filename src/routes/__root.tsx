import '@/app.css'
import '@fontsource/poppins/100.css'
import '@fontsource/poppins/200.css'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import '@fontsource/poppins/900.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ThemeProvider } from '@/contexts/theme-provider'

import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/ui/shared/sonner'

import type { AuthContext } from '@/contexts/auth-provider'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  auth: AuthContext
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Toaster position='top-right' />
      <Outlet />

      {import.meta.env.DEV && <TanStackRouterDevtools />}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </ThemeProvider>
  ),
})
