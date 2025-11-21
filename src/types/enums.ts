export const ModuleBase = {
	USERS: "users",
	AGENTS: "agents",
	COMPANIES: "companies",
	ROLES: "roles",
	CAT_MODULES: "cat-modules",
	PERMISSIONS: "permissions",
	CAMERAS: "cameras",
	SCENARIOS: "scenarios",
	VEHICLES: "vehicles",
	DATA_SOURCES: "data-sources",
	FESTIVAL_DAYS: "festival days",
	KPIS: "kpis",
} as const;

export type MODULE_BASE_NAME = (typeof ModuleBase)[keyof typeof ModuleBase];

export const Action = {
	CREATE: "create",
	UPDATE_USER: "update-user",
	GET_ALL: "get-all",
	DELETE: "delete",

	// Agents
	CREATE_USER_AGENT: "create-user-agent",
	GET_BY_ID: "get-by-id",
	UPDATE: "update",
	AVAILABILITY: "availability",
	SYNC_LOCATION: "sync-location",
	LOCATION: "location",

	// Roles
	ASSOCIATE_MODULES: "associate-modules",

	// Cat Modules
	ACTIVATE: "activate",
	ASSOCIATE_PERMISSIONS: "associate-permissions",
	ASSOCIATE_PERMISSION: "associate-permission",
	DISSOCIATE_PERMISSION: "dissociate-permission",

	// Permissions
	GET_OWNER_PERMISSIONS: "get-owner-permissions",

	// Cameras
	TEST_DB_CONNECTION: "test-db-connection",
	GET_CAMERA: "get-camera",

	// Vehicles
	VEHICLES: "vehicles",

	// Data Sources
	GET: "get",

	// KPIs
	ACTIVE_TICKETS: "active-tickets",
	DASHBOARD_KPIS: "dashboard-kpis",
	TIME_SPENT_ON_SITE: "time-spent-on-site",
	TOP_REASONS_TICKETS_REJECTED: "top-reasons-tickets-rejected",
	ALERT_PERCENTAGE: "alert-percentage",
	ALL_ALERT_AGENTS: "all-alert-agents",
	VEHICLE_VOLUME_BY_HOUR: "vehicle-volume-by-hour",
	VOLUME_PER_ROAD_USER: "volume-per-road-user",
	TICKET_TIME_STATUS: "ticket-time-status",
} as const;

export type ACTION_NAME = (typeof Action)[keyof typeof Action];

export const ROLES_NAMES = {
	ADMIN: "admin",
	ANALISTA: "analista",
	AGENT: "agent",
};

export type ROLES_NAMES = (typeof ROLES_NAMES)[keyof typeof ROLES_NAMES];

export const Module = {
	DASHBOARD: "dashboard",
	USERS: "usuarios",
	COMPANIES: "empresas",
	ROLES: "roles",
	CAT_MODULES: "modulos",

	AGENTS: "agentes",
};
export type MODULE_NAME = (typeof Module)[keyof typeof Module];
