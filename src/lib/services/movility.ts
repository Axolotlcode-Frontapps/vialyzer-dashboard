import type { VehicleType } from "@/types/agents";

import { fetcher } from "@/lib/utils/fetch-api";

export interface MovilityFilters {
	rawScenarioIds?: string | null;
	rawVehicleIds?: string | null;
	startDate: string;
	endDate: string;
}

export interface TotalTrafic {
	totalCount: number;
	byVehicleType: {
		type: string;
		count: number;
	}[];
}

export interface VehicleDistribution {
	vehicleId: string;
	vehicleType: string;
	percentage: number;
}

export interface VolumeTable {
	vehicleid: string;
	vehiclename: string;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string;
}

export interface DailyVehicle {
	date: string;
	metadata: {
		vehicleid: string;
		vehiclename: string;
		vol_acumulate: number;
	}[];
}

export interface VehicleCount {
	hour_of_day: number;
	metadata: {
		vehicleid: string;
		vehiclename: VehicleType;
		vol_acumulate: number;
	}[];
}

export interface AverageSpeed {
	averageSpeed: string;
	unit: string;
}

export interface VehicleSpeedHour {
	hour_of_day: number;
	average_speed: string;
}

export interface VehicleSpeed {
	query_date: string;
	average_speed: string;
}

export interface VelocityTable {
	vehicleid: string;
	vehiclename: string;
	scenariodata: {
		scenarioId: string;
		scenarioName: string;
		volAcumulate: number;
	}[];
	total: string;
}

class MovilityService {
	async totalTraffic(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<TotalTrafic>>(
			`/camera/${camera}/kpis/get-traffic-total-volume`,
			{
				params,
			}
		);

		return payload;
	}

	async vehicleDistribution(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VehicleDistribution[]>>(
			`/camera/${camera}/kpis/get-vehicles-distribution`,
			{
				params,
			}
		);

		return payload;
	}

	async volumeTable(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VolumeTable[]>>(
			`/camera/${camera}/kpis/get-volume-table`,
			{
				params,
			}
		);

		return payload;
	}

	async dailyVehicle(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<DailyVehicle[]>>(
			`/camera/${camera}/kpis/get-daily-vehicule-for-month`,
			{
				params,
			}
		);

		return payload;
	}

	async vehicleCount(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VehicleCount[]>>(
			`/camera/${camera}/kpis/get-data-volumen-by-last-day-hours`,
			{
				params,
			}
		);

		return payload;
	}

	async averageSpeed(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<AverageSpeed>>(
			`/camera/${camera}/kpis/get-average-speed`,
			{
				params,
			}
		);

		return payload;
	}

	async vehicleSpeedHour(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VehicleSpeedHour[]>>(
			`/camera/${camera}/kpis/get-average-speed-by-hour`,
			{
				params,
			}
		);

		return payload;
	}

	async velocityTable(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VelocityTable[]>>(
			`/camera/${camera}/kpis/get-vehicle-scenario-speed-matrix`,
			{
				params,
			}
		);
		return payload;
	}

	async vehicleSpeed(camera: string, params: MovilityFilters) {
		const { payload } = await fetcher<GeneralResponse<VehicleSpeed[]>>(
			`/camera/${camera}/kpis/get-graphic-km-promedy`,
			{
				params,
			}
		);

		return payload;
	}
}

export const movility = new MovilityService();
