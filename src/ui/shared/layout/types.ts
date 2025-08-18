import type { LucideIcon } from 'lucide-react'

export type TNavItem = {
  title: string
  to?: string
  icon?: LucideIcon
  defaultOpen?: boolean
  items?: TNavItem[]
}

export interface INavSection {
  group: string
  items: TNavItem[]
}
