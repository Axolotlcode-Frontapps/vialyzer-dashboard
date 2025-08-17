import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '../sidebar'
import { SquareTerminal } from 'lucide-react'
import { NavMain } from './nav-main'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = [
    {
      title: 'Inicio',
      icon: SquareTerminal,
      isActive: true,
      to: '/',
    },
    {
      title: 'Configuración',
      to: '/settings',
      icon: SquareTerminal,
      items: [
        { title: 'Perfil', to: '/settings/profile' },
        { title: 'Preferencias', to: '/settings/preferences' },
      ],
    },
  ]

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='w-full grid place-content-center'>DS</div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
