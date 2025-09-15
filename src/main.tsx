import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";

import { AuthProvider, useAuth } from "./contexts/auth";
import { PermissionsProvider, usePermissions } from "./contexts/permissions";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: {
		queryClient,
		auth: undefined!,
		permissions: undefined!,
	},
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	const auth = useAuth();
	const permissions = usePermissions();

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} context={{ auth, permissions }} />
		</QueryClientProvider>
	);
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<AuthProvider>
				<PermissionsProvider>
					<App />
				</PermissionsProvider>
			</AuthProvider>
		</StrictMode>
	);
}
