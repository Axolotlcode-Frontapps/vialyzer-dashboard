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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/contexts/theme";

import type { QueryClient } from "@tanstack/react-query";
import type { AuthContext } from "@/contexts/auth";

import { Toaster } from "@/ui/shared/sonner";

interface MyRouterContext {
	auth: AuthContext;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Toaster position="top-right" />
			<Outlet />

			{import.meta.env.DEV && <TanStackRouterDevtools />}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</ThemeProvider>
	),
});
