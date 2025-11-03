import { UserMenu } from "./layout/user-menu";
import { ModeToggle } from "./mode-toggle";
import { SidebarTrigger } from "./sidebar";

export function Header() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center justify-between px-4 gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			{/* // <header className="flex items-center justify-between px-5 md:px-8 h-16 shrink-0 gap-2.5"> */}
			<SidebarTrigger />

			<div className="flex items-center justify-between gap-2.5">
				<ModeToggle />
				<UserMenu />
			</div>
		</header>
	);
}
