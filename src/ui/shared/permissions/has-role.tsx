import { useHasRole } from "@/hooks/use-permissions";

import type { MODULE_BASE_NAME } from "@/types/enums";

export interface HasRoleProps {
	roleName: MODULE_BASE_NAME;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function HasRole({ children, roleName, fallback = null }: HasRoleProps) {
	const { hasRole } = useHasRole();
	return hasRole(roleName) ? children : fallback;
}
