import "@/app.css";
import "@fontsource/poppins/100.css";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/contexts/theme";

import type { QueryClient } from "@tanstack/react-query";
import type { AuthContext } from "@/contexts/auth";
import type { PermissionsContext } from "@/contexts/permissions";

import { Toaster } from "@/ui/shared/sonner";

interface MyRouterContext {
	queryClient: QueryClient;
	auth: AuthContext;
	permissions: PermissionsContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Toaster position="top-right" />
			<Outlet />

			{import.meta.env.DEV && (
				<TanStackDevtools
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						FormDevtoolsPlugin(),
					]}
				/>
			)}
		</ThemeProvider>
	),
});
