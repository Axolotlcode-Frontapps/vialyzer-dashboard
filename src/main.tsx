import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";

import { AuthProvider, useAuth } from "./contexts/auth";
import { PermissionsProvider } from "./contexts/permissions";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
		},
	},
});

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

	return (
		<QueryClientProvider client={queryClient}>
			<PermissionsProvider>
				<RouterProvider router={router} context={{ auth }} />
			</PermissionsProvider>
		</QueryClientProvider>
	);
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<AuthProvider>
			<App />
		</AuthProvider>
	);
}
