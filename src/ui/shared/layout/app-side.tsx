import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '../sidebar'
import {
  Camera,
  FileChartColumnIncreasing,
  FileChartLine,
  House,
  Megaphone,
  Settings,
  Shield,
  User,
  Video,
} from 'lucide-react'
import { NavSection } from './nav-section'
import type { INavSection } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const principalMenu: INavSection = {
    group: 'Principal',
    items: [
      {
        icon: House,
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
        icon: Video,
        defaultOpen: true,
        items: [
          {
            icon: Camera,
            title: 'Transito',
            to: '/mobility',
          },
          {
            icon: Megaphone,
            title: 'Seguridad vial',
            to: '/mobility/security',
          },
          {
            icon: FileChartColumnIncreasing,
            title: 'Pronostico',
            to: '/mobility/forecast',
          },
          {
            icon: FileChartLine,
            title: 'Cruce de variables',
            to: '/mobility/variables',
          },
        ],
      },
      {
        title: 'Monitoreo',
        icon: Video,
        defaultOpen: true,
        items: [
          {
            icon: Camera,
            title: 'Agentes',
            to: '/monitoring',
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
        icon: Settings,
        defaultOpen: true,
        items: [
          {
            title: 'Roles',
            icon: Shield,
            to: '/settings/roles',
          },
          {
            title: 'Usuarios',
            icon: User,
            to: '/settings/users',
          },
          {
            title: 'Empresas',
            icon: Settings,
            to: '/settings/companies',
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
