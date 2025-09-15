import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { GoogleMapsProvider } from "@/contexts/maps";
import { PermissionsProvider } from "@/contexts/permissions";

import { authServices } from "@/lib/services/auth";
import { Header } from "@/ui/shared/header";
import { AppSidebar } from "@/ui/shared/layout/app-side";
import { SidebarInset, SidebarProvider } from "@/ui/shared/sidebar";

const getMeQuery = queryOptions({
	queryKey: ["get-me"],
	queryFn: async () => await authServices.getMeUser(),
});

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: "/auth",
				replace: true,
			});
		}
	},
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(getMeQuery);
	},
	component: PrivateLayout,
});

function PrivateLayout() {
	return (
		<PermissionsProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<Header />
					<main className="min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-108px)] flex flex-col pt-4 pb-5 md:pb-8 px-5 md:px-8">
						<GoogleMapsProvider>
							<Outlet />
						</GoogleMapsProvider>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</PermissionsProvider>
	);
}
