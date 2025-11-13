import type { ROLES_NAMES } from "@/types/enums";

export const hasRole = (role: keyof typeof ROLES_NAMES, user: User) => {
	if (!user || !role) return false;
	return user.role.name.toLowerCase() === role.toLowerCase();
};

export const hasModule = (moduleName: string, user: User) => {
	if (!user || !moduleName) return false;
	return user.role.modules.some(
		(module) => module.name.toLowerCase() === moduleName.toLowerCase()
	);
};

export const hasPermission = (permissionName: string, user: User) => {
	if (!user || !permissionName) return false;
	return user.role.permissions.some(
		(permission) =>
			permission.action.toLowerCase() === permissionName.toLowerCase()
	);
};

export const hasMultiplePermissions = (
	permissionNames: string[],
	user: User
) => {
	if (!user || !permissionNames || permissionNames.length === 0) return false;
	return permissionNames.every((permissionName) =>
		user.role.permissions.some(
			(permission) =>
				permission.action.toLowerCase() === permissionName.toLowerCase()
		)
	);
};
