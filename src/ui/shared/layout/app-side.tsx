import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '../sidebar'
import { SquareTerminal } from 'lucide-react'
import { NavSection } from './nav-section'
import type { INavSection } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const principalMenu: INavSection = {
    group: 'Principal',
    items: [
      {
        icon: SquareTerminal,
        title: 'Dashboard',
        to: '/',
      },
    ],
  }

  const metricsMenu: INavSection = {
    group: 'Métricas',
    items: [
      {
        title: 'Movilidad',
        icon: SquareTerminal,
        defaultOpen: true,
        items: [
          {
            icon: SquareTerminal,
            title: 'Transito',
            to: '/settings/profile',
          },
          {
            icon: SquareTerminal,
            title: 'Seguridad vial',
            to: '/settings/preferences',
          },
          {
            icon: SquareTerminal,
            title: 'Pronostico',
            to: '/settings/preferences',
          },
          {
            icon: SquareTerminal,
            title: 'Cruce de variables',
            to: '/settings/preferences',
          },
        ],
      },
      {
        title: 'Monitoreo',
        icon: SquareTerminal,
        defaultOpen: true,
        items: [
          {
            icon: SquareTerminal,
            title: 'Agentes',
            to: '/settings/profile',
          },
        ],
      },
    ],
  }

  const settingsMenu: INavSection = {
    group: 'Configuración',
    items: [
      {
        title: 'Administración',
        icon: SquareTerminal,
        defaultOpen: true,
        items: [
          {
            title: 'Roles',
            icon: SquareTerminal,
            to: '/settings/profile',
          },
          {
            title: 'Usuarios',
            icon: SquareTerminal,
            to: '/settings/preferences',
          },
          {
            title: 'Empresas',
            icon: SquareTerminal,
            to: '/settings/preferences',
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='w-full grid place-content-center'>DS</div>
      </SidebarHeader>
      <SidebarContent>
        <NavSection group={principalMenu.group} items={principalMenu.items} />
        <NavSection group={metricsMenu.group} items={metricsMenu.items} />
        <NavSection group={settingsMenu.group} items={settingsMenu.items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
