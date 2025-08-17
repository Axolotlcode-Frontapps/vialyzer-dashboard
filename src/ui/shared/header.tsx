import { ModeToggle } from './mode-toggle'
import { SidebarTrigger } from './sidebar'
import { UserMenu } from './layout/user-menu'

export function Header() {
  return (
    <>
      <header className='flex items-center justify-between px-5 md:px-8 h-16 shrink-0 gap-2.5'>
        <SidebarTrigger />

        <div className='flex items-center justify-between gap-2.5'>
          <ModeToggle />
          <UserMenu />
        </div>
      </header>
    </>
  )
}
