import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Button } from "../button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import { HasModule } from "../permissions/has-module";

export function UserMenu() {
	const user = {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	};

	const queryClient = useQueryClient();

	const userMe = queryClient.getQueryData<GeneralResponse<User>>([
		"get-me",
	])?.payload;

	const router = useRouter();
	const auth = useAuth();

	async function handleLogout() {
		await auth.logout();
		await router.invalidate();
		await router.navigate({ to: "/" });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="lg"
					variant="secondary"
					className="data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground size-10 rounded-full p-0 crusor-pointer"
				>
					<Avatar className="size-10 rounded-full grid place-content-center">
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className="uppercase">
							{userMe?.name?.charAt(0) ?? user.name.charAt(0)}
							{userMe?.lastname?.charAt(0) ?? ""}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={user.avatar} alt={user.name} />
							<AvatarFallback className="uppercase">
								{userMe?.name?.charAt(0) ?? user.name.charAt(0)}
								{userMe?.lastname?.charAt(0) ?? ""}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">
								{userMe?.name} {userMe?.lastname}
							</span>
							<span className="truncate text-xs">{userMe?.email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<HasModule moduleName="perfil">
						<DropdownMenuItem
							onClick={() => router.navigate({ to: "/profile" })}
						>
							<BadgeCheck />
							Mi cuenta
						</DropdownMenuItem>
					</HasModule>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut />
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
