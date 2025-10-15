import type { FilterSchema } from "../hooks/use-graph-filters";

export type Status =
	| "UNIT_DISCONNECTED"
	| "UNIT_IMPAIRED"
	| "PROVISIONING"
	| "PROVISIONING_FAILED"
	| "VALIDATION_FAILED"
	| "VALIDATION"
	| "PROCESSING_STOPPED"
	| "WAITING_FOR_CONFIGURATION"
	| "CAMERA_ERROR"
	| "CAMERA_DISCONNECTED"
	| "VIEW_CHANGED"
	| "PROCESSING";

export type StatusType = "normal" | "warning" | "error";

export interface Location {
	id: string;
	name: string;
	externalId: string;
	state: Status;
	location: {
		latitude: string;
		longitude: string;
		timezone: string;
	};
	createdAt: string;
	updatedAt: string;
	project: {
		id: string;
		name: string;
		externalId: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface TimeRange {
	startDate: string;
	endDate: string;
}

export type RangeDates = "7d" | "30d" | "custom";

export type RangeInterval = {
	date: string;
	startInterval: string;
	endInterval: string;
};

export type VehicleType =
	| "BUS"
	| "CAR"
	| "VAN"
	| "TRUCK"
	| "PERSON"
	| "BICYCLE"
	| "MOTORCYCLE"
	| "HEAVY TRUCK";

export type GraphFilters = Omit<
	FilterSchema,
	"year" | "month" | "date" | "startInterval" | "endInterval" | "camera"
>;
export type GraphWeekFilters = Omit<GraphFilters, "dayOfWeek">;
export type GraphDailyFilters = GraphFilters;

export interface Vehicle {
	id: string;
	name: VehicleType;
	externalId: string;
}

export interface Scenario {
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

export interface TrafficTotal {
	// Volume
	totalCount: number;
	byVehicleType: Record<VehicleType, number>;
}

export interface AverageSpeed {
	// Volume
	averageSpeed: number;
	unit: string;
}

export type SpeedTable = {
	vehicleid: string;
	vehiclename: VehicleType;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string | number;
}[];

export type VehiclesSpeed = {
	query_date: string;
	average_speed: string;
}[];

export type VehiclesSpeedHour = {
	hour_of_day: number;
	average_speed: string;
}[];

export type VolumeTable = {
	vehicleid: string;
	vehiclename: VehicleType;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string | number;
}[];

export type DailyVehicle = {
	date: string;
	metadata: {
		vehicleid: string;
		vehiclename: VehicleType;
		vol_acumulate: number;
	}[];
}[];

export interface MonthlyVehicle {
	// Monthly vehicle count
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

export type VehicleCount = {
	hour_of_day: number;
	metadata: {
		vehicleid: string;
		vehiclename: VehicleType;
		vol_acumulate: number;
	}[];
}[];

export interface VehicleDistribution {
	// Modal distribution
	vehicleId: string;
	vehicleType: string;
	percentage: number;
}

export interface WeeComparison {
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

export interface CameraScenario {
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

export interface VehicleOccurrence {
	id: string;
	name: VehicleType;
	externalId: string;
	occurrenceCount: number;
	createdAt: string;
	updatedAt: string;
}

// Accident and Construction Reports from Google Maps API
export interface TrafficIncident {
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

export interface AccidentReport extends TrafficIncident {
	type: "ACCIDENT";
	vehiclesInvolved?: number;
	injuries?: boolean;
	fatalities?: boolean;
}

export interface ConstructionReport extends TrafficIncident {
	type: "CONSTRUCTION";
	projectName?: string;
	estimatedCompletion?: string;
	laneClosures?: number;
}
