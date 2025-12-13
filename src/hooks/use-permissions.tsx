import { usePermissions } from "@/contexts/permissions";

import type { ACTION_NAME, MODULE_BASE_NAME, MODULE_NAME, ROLES_NAMES } from "@/types/enums";

import {
	hasAnyMultiplePermissions,
	hasModule,
	hasMultiplePermissions,
	hasPermission,
	hasRole,
} from "@/lib/utils/permissions";

export const useHasRole = () => {
	const { user } = usePermissions();

	const hasVerifyRole = (role: ROLES_NAMES) => hasRole(role, user!);
	return { hasRole: hasVerifyRole };
};

export const useHasModule = () => {
	const { user } = usePermissions();

	const hasModuleVerify = (moduleName: MODULE_NAME) => hasModule(moduleName, user!);
	return { hasModule: hasModuleVerify };
};

export const useHasPermission = () => {
	const { user } = usePermissions();

	const hasPermissionVerify = (moduleBase: MODULE_BASE_NAME, permissionName: ACTION_NAME) =>
		hasPermission(moduleBase, permissionName, user!);

	const hasAnyMultiplePermissionsVerify = (
		moduleBase: MODULE_BASE_NAME,
		permissionNames: ACTION_NAME[]
	) => hasAnyMultiplePermissions(moduleBase, permissionNames, user!);

	const hasMultiplePermissionsVerify = (
		moduleBase: MODULE_BASE_NAME,
		permissionNames: ACTION_NAME[]
	) => hasMultiplePermissions(moduleBase, permissionNames, user!);

	return {
		hasPermission: hasPermissionVerify,
		hasAnyMultiplePermissions: hasAnyMultiplePermissionsVerify,
		hasMultiplePermissions: hasMultiplePermissionsVerify,
	};
};
