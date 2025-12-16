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
	DESTROY_ALL_HTTP_INSTANCES: "destroy-all-http-instances",
	DESTROY_MONGO_CONNECTION: "destroy-mongo-connection",
	GET_CAMERA_PREVIEW: "get-camera-preview",
	GET_ALL_CAMERA_PREVIEW: "get-all-camera-preview",

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
	GET_VEHICLES_DISTRIBUTION: "get-vehicles-distribution",
	GET_VEHICLE_COUNT_BY_15MIN_INTERVAL: "get-vehicle-count-by-15min-interval",
	GET_MONTHLY_VEHICLE_COUNTS: "get-monthly-vehicle-counts",
	GET_WEEK_WEEKEND_COMPARISON: "get-week-weekend-comparison",
	GET_DAILY_VEHICLE_COUNTS_FOR_MONTH: "get-daily-vehicle-counts-for-month",
	GET_TRAFFIC_PEAK_HOURS: "get-traffic-peak-hours",
	GET_VOLUME_TABLE: "get-volume-table",
	GET_DAILY_VEHICLE_FOR_MONTH: "get-daily-vehicule-for-month",
	GET_DATA_VOLUME_BY_LAST_DAY_HOURS: "get-data-volumen-by-last-day-hours",
	GET_AVERAGE_SPEED: "get-average-speed",
	GET_AVERAGE_SPEED_BY_HOUR: "get-average-speed-by-hour",
	GET_VEHICLE_SCENARIO_SPEED_MATRIX: "get-vehicle-scenario-speed-matrix",
	GET_GRAPHIC_KM_PROMEDY: "get-graphic-km-promedy",
	GET_TRAFFIC_TOTAL_VOLUME: "get-traffic-total-volume",

	// Tickets
	GET_TICKET_BY_ID: "get-ticket-by-id",
	GET_TICKET_BY_AGENT: "get-ticket-by-agent",
	GET_AGENT: "get-agent",
	GET_DOC_REPORTS: "get-doc-reports",
	ASSIGN_AGENT: "assign-agent",
	REJECT: "reject",
} as const;

export type ACTION_NAME = (typeof Action)[keyof typeof Action];

export const rolesNames = {
	ADMIN: "admin",
	ANALISTA: "analista",
	AGENT: "agent",
} as const;

export type ROLES_NAMES = (typeof rolesNames)[keyof typeof rolesNames];

export const Module = {
	DASHBOARD: "dashboard",
	USERS: "usuarios",
	PROFILE: "perfil",
	COMPANIES: "empresas",
	ROLES: "roles",
	CAT_MODULES: "modulos",
	AGENTS: "agentes",
	TRANSIT: "transito",
	CONFIG_CAMERAS: "configuracion-camaras",
	MOVILITY: "movilidad",
} as const;

export type MODULE_NAME = (typeof Module)[keyof typeof Module];
