import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ReactNode } from "react";

import { usersService } from "@/lib/services/users";
import { useAuth } from "./auth";

export interface PermissionsContext {
	user: User | null;
}

const PermissionsContext = createContext<PermissionsContext | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
	const { signInResponse } = useAuth();

	const { data: userState = null } = useQuery({
		queryKey: ["get-me"],
		queryFn: async () => await usersService.getMeUser(),
		enabled: !!signInResponse?.token,
		select: (data) => data.payload,
	});

	return (
		<PermissionsContext.Provider value={{ user: userState }}>
			{children}
		</PermissionsContext.Provider>
	);
}

export function usePermissions() {
	const context = useContext(PermissionsContext);
	if (!context) {
		throw new Error("usePermissions must be used within a PermissionsProvider");
	}
	return context;
}
