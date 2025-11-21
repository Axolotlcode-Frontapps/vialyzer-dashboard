import { usePermissions } from "@/contexts/permissions";

import type { ROLES_NAMES } from "@/types/enums";

import {
	hasAnyMultiplePermissions,
	hasModule,
	hasMultiplePermissions,
	hasPermission,
	hasRole,
} from "@/lib/utils/permissions";

export const useHasRole = () => {
	const { user } = usePermissions();

	const hasVerifyRole = (role: keyof typeof ROLES_NAMES) =>
		hasRole(role, user!);
	return { hasRole: hasVerifyRole };
};

export const useHasModule = () => {
	const { user } = usePermissions();

	const hasModuleVerify = (moduleName: string) => hasModule(moduleName, user!);
	return { hasModule: hasModuleVerify };
};

export const useHasPermission = () => {
	const { user } = usePermissions();

	const hasPermissionVerify = (moduleBase: string, permissionName: string) =>
		hasPermission(moduleBase, permissionName, user!);

	const hasAnyMultiplePermissionsVerify = (
		moduleBase: string,
		permissionNames: string[]
	) => hasAnyMultiplePermissions(moduleBase, permissionNames, user!);

	const hasMultiplePermissionsVerify = (
		moduleBase: string,
		permissionNames: string[]
	) => hasMultiplePermissions(moduleBase, permissionNames, user!);

	return {
		hasPermission: hasPermissionVerify,
		hasAnyMultiplePermissions: hasAnyMultiplePermissionsVerify,
		hasMultiplePermissions: hasMultiplePermissionsVerify,
	};
};
