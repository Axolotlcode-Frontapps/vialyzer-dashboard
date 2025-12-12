import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { GoogleMapsProvider } from "@/contexts/maps";

import { usersService } from "@/lib/services/users";
import { Header } from "@/ui/shared/header";
import { AppSidebar } from "@/ui/shared/layout/app-side";
import { SidebarInset, SidebarProvider } from "@/ui/shared/sidebar";

const getMeQuery = queryOptions({
	queryKey: ["get-me"],
	queryFn: async () => await usersService.getMeUser(),
});

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { auth, queryClient } }) => {
		if (!auth.isAuthenticated) {
			throw redirect({
				to: "/auth",
				replace: true,
			});
		}

		const { payload: user } = await queryClient.ensureQueryData(getMeQuery);

		return {
			permissions: {
				user,
			},
		};
	},
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(getMeQuery);
	},
	component: PrivateLayout,
});

function PrivateLayout() {
	const queryClient = useQueryClient();
	const navigate = Route.useNavigate();
	const user = queryClient.getQueryData<GeneralResponse<User>>(getMeQuery.queryKey)?.payload;

	useEffect(() => {
		if (user?.firstLogin) {
			navigate({ to: "/update-password" });
			usersService.updateCurrentUser();
		}
	}, [user, navigate]);

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2 p-4">
						<GoogleMapsProvider>
							<Outlet />
						</GoogleMapsProvider>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
