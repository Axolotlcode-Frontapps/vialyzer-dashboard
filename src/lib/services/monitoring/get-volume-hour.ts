import type { AxiosInstance } from "axios";

import { rangeDates } from "@/lib/utils/date-format";

export interface VolumeHourData {
	metadata: {
		vehicle_id: string;
		name: string;
		color: string; // "[37, 140, 219]"
	}[];
	data: {
		hour: number; // 0-23
		count: number;
	}[];
}

export interface VolumeHourParams {
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

export const getVolumeHour = async (
	instance: AxiosInstance,
	params?: VolumeHourParams
) => {
	try {
		const defaultRange = getDefaultDateRange();
		const queryParams = {
			start_date: params?.start || defaultRange.start,
			end_date: params?.end || defaultRange.end,
		};
		const response = await instance.get<GeneralResponse<VolumeHourData>>(
			"/kpi/vehicle-volume-by-hour",
			{
				params: queryParams,
			}
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener el volumen por hora");
		}

		return response.data.payload;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
