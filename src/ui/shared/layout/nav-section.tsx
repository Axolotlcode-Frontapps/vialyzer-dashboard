'use client'

import { ChevronRight } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible'
import { Link } from '@tanstack/react-router'
import type { INavSection } from './types'

export function NavSection({ group, items }: INavSection) {
  return (
    <SidebarGroup>
      {group ? <SidebarGroupLabel>{group}</SidebarGroupLabel> : null}

      <SidebarMenu>
        {items.map((item) => {
          if (!item.items)
            return (
              <SidebarMenuButton
                key={item.title}
                tooltip={item.title}
                className='cursor-pointer'>
                {item.icon && <item.icon />}
                <Link to={item.to}>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.defaultOpen}
              asChild
              className='group/collapsible'>
              <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.to}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
