import type { AxiosInstance } from "axios";

import { rangeDates } from "../../utils/date-format";

export interface TimePermanenceData {
	name: string;
	avg_minutes: number;
}

export interface TimePermanenceParams {
	start?: string;
	end?: string;
	vehicle_ids?: string;
}

const getDefaultDateRange = () => {
	const { startDate, endDate } = rangeDates("30d");

	return {
		start: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
		end: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
	};
};

export const getTimePermanence = async (instance: AxiosInstance, params?: TimePermanenceParams) => {
	try {
		const defaultRange = getDefaultDateRange();
		const queryParams = {
			start_date: params?.start || defaultRange.start,
			end_date: params?.end || defaultRange.end,
			...(params?.vehicle_ids && { vehicle_ids: params.vehicle_ids }),
		};

		const response = await instance.get<GeneralResponse<TimePermanenceData[]>>(
			"/kpi/time-spent-on-site",
			{ params: queryParams }
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener el tiempo de permanencia");
		}

		if (!response.data.success) {
			throw new Error(response.data.message || "Error al obtener el tiempo de permanencia");
		}

		return response.data.payload;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
