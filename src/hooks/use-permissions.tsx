import { usePermissions } from "@/contexts/permissions";

import type { ROLES_NAMES } from "@/types/enums";

import {
	hasModule,
	hasMultiplePermissions,
	hasPermission,
	hasRole,
} from "@/lib/utils/permissions";

export const useHasRole = () => {
	const { user } = usePermissions();
	if (!user) return;

	const hasVerifyRole = (role: keyof typeof ROLES_NAMES) => hasRole(role, user);
	return { hasRole: hasVerifyRole };
};

export const useHasModule = () => {
	const { user } = usePermissions();
	if (!user) return;

	const hasModuleVerify = (moduleName: string) => hasModule(moduleName, user);
	return { hasModule: hasModuleVerify };
};

export const useHasPermission = () => {
	const { user } = usePermissions();
	if (!user) return;

	const hasPermissionVerify = (permissionName: string) =>
		hasPermission(permissionName, user);
	const hasMultiplePermissionsVerify = (permissionNames: string[]) =>
		hasMultiplePermissions(permissionNames, user);

	return {
		hasPermission: hasPermissionVerify,
		hasMultiplePermissions: hasMultiplePermissionsVerify,
	};
};
