import { useHasRole } from "@/hooks/use-permissions";

import type { ROLES_NAMES } from "@/types/enums";

export interface HasRoleProps {
	roleName: ROLES_NAMES;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function HasRole({ children, roleName, fallback = null }: HasRoleProps) {
	const { hasRole } = useHasRole();
	return hasRole(roleName) ? children : <span className="text-sm">{fallback}</span>;
}
