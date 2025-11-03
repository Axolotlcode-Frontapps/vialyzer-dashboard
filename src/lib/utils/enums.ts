const ACTIONS = {
	CREATE: "create",
	UPDATE_USER: "update-user",
	GET_ALL: "get-all",
	DELETE: "delete",
	CREATE_USER_AGENT: "create-user-agent",
	GET_BY_ID: "get-by-id",
	UPDATE: "update",
	AVAILABILITY: "availability",
	ASSOCIATE_MODULES: "associate-modules",
	SYNC_LICENSE_PERMISSIONS: "sync-license-permissions",
	SYNC_LOCATION: "sync-location",
	LOCATION: "location",
	ACTIVATE: "activate",
	ASSOCIATE_PERMISSIONS: "associate-permissions",
	GET_OWNER_PERMISSIONS: "get-owner-permissions",
} as const;

const MODULES = {
	USERS: "users",
	AGENTS: "agents",
	COMPANIES: "companies",
	ROLES: "roles",
	PERMISSIONS: "permissions",
	CAT_MODULES: "cat-modules",
} as const;

type Modules = (typeof MODULES)[keyof typeof MODULES];
type Actions = (typeof ACTIONS)[keyof typeof ACTIONS];
