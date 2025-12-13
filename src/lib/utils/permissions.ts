import type { ACTION_NAME, MODULE_BASE_NAME, MODULE_NAME, ROLES_NAMES } from "@/types/enums";

export const hasRole = (role: ROLES_NAMES, user: User) => {
	if (!user || !role) return false;
	return user.role.name.toLowerCase() === role.toLowerCase();
};

export const hasModule = (moduleName: MODULE_NAME, user: User) => {
	if (!user || !moduleName) return false;
	return user.role.modules.some((module) => module.name.toLowerCase() === moduleName.toLowerCase());
};

export const hasPermission = (
	moduleBase: MODULE_BASE_NAME,
	permissionName: ACTION_NAME,
	user: User
) => {
	if (!user || !permissionName || !moduleBase) return false;
	return user.role.permissions.some(
		(permission) =>
			permission.action.toLowerCase() === permissionName.toLowerCase() &&
			permission.module.toLowerCase() === moduleBase.toLowerCase()
	);
};

export const hasMultiplePermissions = (
	moduleBase: MODULE_BASE_NAME,
	permissionNames: ACTION_NAME[],
	user: User
) => {
	if (!user || !permissionNames || permissionNames.length === 0 || !moduleBase) return false;
	return permissionNames.every((permissionName) =>
		user.role.permissions.some(
			(permission) =>
				permission.action.toLowerCase() === permissionName.toLowerCase() &&
				permission.module.toLowerCase() === moduleBase.toLowerCase()
		)
	);
};

export const hasAnyMultiplePermissions = (
	moduleBase: MODULE_BASE_NAME,
	permissionNames: ACTION_NAME[],
	user: User
) => {
	if (!user || !permissionNames || permissionNames.length === 0 || !moduleBase) return false;
	return permissionNames.some((permissionName) =>
		user.role.permissions.some(
			(permission) =>
				permission.action.toLowerCase() === permissionName.toLowerCase() &&
				permission.module.toLowerCase() === moduleBase.toLowerCase()
		)
	);
};
