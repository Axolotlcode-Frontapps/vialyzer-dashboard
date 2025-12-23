export type VehicleType =
	| "BUS"
	| "CAR"
	| "VAN"
	| "TRUCK"
	| "PERSON"
	| "BICYCLE"
	| "MOTORCYCLE"
	| "HEAVY TRUCK";

interface Agent {
	id: string;
	user?: User;
	userId: string;
	identification: string;
	secondName: string;
	plaque: string;
	availability: boolean;
	userImage: string;
	location: {
		latitude: string;
		longitude: string;
		locationToken: string;
		updatedAt: string;
	};
}

interface NotificationItem {
	id: string;
	ticket_id: string;
	ticket_status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
	img_url: string;
	description: string;
	maps_coordinates: `[${string}, ${string}]`;
	vehicle: string;
	createAt: string;
	hours_pending: number;
	minutes_pending: number;
}

interface KPIs {
	available_agents: number;
	unavailable_agents: number;
	average_hours: number;
	average_minutes: number;
	peak_day: string;
	peak_hour: number;
	total_tickets: number;
	unattended_alerts: number;
	effectiveness_percent: number;
}

interface Scenario {
	id: string;
	name: string;
	externalId: string;
	groupBy: string[];
	dataFrom: string;
	camera: {
		id: string;
		name: string;
		externalId: string;
	};
}

interface TrafficTotal {
	totalCount: number;
	byVehicleType: Record<VehicleType, number>;
}

interface AverageSpeed {
	averageSpeed: number;
	unit: string;
}

type SpeedTable = {
	vehicleid: string;
	vehiclename: VehicleType;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string | number;
}[];

type VehiclesSpeed = {
	query_date: string;
	average_speed: string;
}[];

type VehiclesSpeedHour = {
	hour_of_day: number;
	average_speed: string;
}[];

type VolumeTable = {
	vehicleid: string;
	vehiclename: VehicleType;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string | number;
}[];

type DailyVehicle = {
	date: string;
	metadata: {
		vehicleid: string;
		vehiclename: VehicleType;
		vol_acumulate: number;
	}[];
}[];

interface MonthlyVehicle {
	data: {
		count: number;
		vehicleType: string;
		yearMonth: string;
	}[];
	metadata: {
		startMonth: string;
		endMonth: string;
		maxCount: number;
		minCount: number;
	};
}

type VehicleCount = {
	hour_of_day: number;
	metadata: {
		vehicleid: string;
		vehiclename: VehicleType;
		vol_acumulate: number;
	}[];
}[];

interface VehicleDistribution {
	vehicleId: string;
	vehicleType: string;
	percentage: number;
}

interface WeeComparison {
	metadata: {
		overallTotal: number;
		weekdayTotal: number;
		weekendTotal: number;
	};
	data: {
		vehicleType: VehicleType;
		periodType: "WEEKDAY" | "WEEKEND";
		count: number;
	}[];
}

interface CameraScenario {
	id: string;
	name: string;
	externalId: string;
	state: string;
	createdAt: string;
	updatedAt: string;
	scenarios: {
		id: string;
		name: string;
		unit: boolean;
	}[];
}

interface VehicleOccurrence {
	id: string;
	name: VehicleType;
	externalId: string;
	occurrenceCount: number;
	createdAt: string;
	updatedAt: string;
}

interface TrafficIncident {
	id: string;
	type: "ACCIDENT" | "CONSTRUCTION" | "ROAD_CLOSURE" | "TRAFFIC_JAM";
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	location: {
		latitude: number;
		longitude: number;
	};
	description: string;
	startTime: string;
	endTime?: string;
	roadName?: string;
	affectedArea?: {
		radius: number;
	};
}

interface AccidentReport extends TrafficIncident {
	type: "ACCIDENT";
	vehiclesInvolved?: number;
	injuries?: boolean;
	fatalities?: boolean;
}

interface ConstructionReport extends TrafficIncident {
	type: "CONSTRUCTION";
	projectName?: string;
	estimatedCompletion?: string;
	laneClosures?: number;
}

type GraphFilters = Omit<
	FilterSchema,
	"year" | "month" | "date" | "startInterval" | "endInterval" | "camera"
>;
type GraphWeekFilters = Omit<GraphFilters, "dayOfWeek">;
type GraphDailyFilters = GraphFilters;

interface Vehicle {
	id: string;
	name: VehicleType;
	externalId: string;
}
