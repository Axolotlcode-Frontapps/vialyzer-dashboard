import { cn } from "@/lib/utils/cn";
import { UserMenu } from "./layout/user-menu";
import { ModeToggle } from "./mode-toggle";
import { SidebarTrigger } from "./sidebar";

export function Header() {
	return (
		<header
			className={cn(
				"flex h-(--header-height) shrink-0 items-center  px-4 py-2 gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
				"justify-between"
			)}
		>
			<SidebarTrigger />
			<div className="flex items-center justify-between gap-2.5">
				<ModeToggle />
				<UserMenu />
			</div>
		</header>
	);
}
