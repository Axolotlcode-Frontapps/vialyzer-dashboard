import { useHasPermission } from "@/hooks/use-permissions";

import type { ACTION_NAME, MODULE_BASE_NAME } from "@/types/enums";

interface HasPermissionProps {
	permissionName: ACTION_NAME;
	moduleBase: MODULE_BASE_NAME;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function HasPermission({
	children,
	moduleBase,
	permissionName,
	fallback = null,
}: HasPermissionProps) {
	const { hasPermission } = useHasPermission();
	return hasPermission(moduleBase, permissionName) ? children : fallback;
}

interface HasMultiplePermissionsProps {
	moduleBase: MODULE_BASE_NAME;
	permissionNames: ACTION_NAME[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function HasMultiplePermissions({
	moduleBase,
	children,
	permissionNames,
	fallback = null,
}: HasMultiplePermissionsProps) {
	const { hasMultiplePermissions } = useHasPermission();
	return hasMultiplePermissions(moduleBase, permissionNames)
		? children
		: fallback;
}
