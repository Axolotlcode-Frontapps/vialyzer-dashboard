import { useHasPermission } from "@/hooks/use-permissions";

interface HasPermissionProps {
	permissionName: string;
	moduleBase: string;
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
	moduleBase: string;
	permissionNames: string[];
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
