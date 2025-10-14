export const Module = {
	USERS: "users",
	PERMISSION: "permission",
	ROLE_PERMISSION: "role-permission",
	ROLES: "roles",
	MOBILITY: "mobility",
	COMPANIES: "companies",
	DASHBOARD: "dashboard",
	PROFILE: "profile",
	CAMERAS: "cameras",
	MONITORING: "monitoring",
} as const;

export type Module = (typeof Module)[keyof typeof Module];

export const Action = {
	CREATE: "create",
	UPDATE: "update",
	DELETE: "delete",
	GET_ALL: "get-all",
	GET_BY_ID: "get-by-id",
	GET_ME: "get-me",
} as const;

export type Action = (typeof Action)[keyof typeof Action];
