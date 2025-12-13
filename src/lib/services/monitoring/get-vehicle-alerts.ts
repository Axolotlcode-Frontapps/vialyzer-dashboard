import type { AxiosInstance } from "axios";

import { rangeDates } from "../../utils/date-format";

export interface VehicleAlertData {
	name: string;
	total: number;
	porcentaje: number;
}

export interface VehicleAlertsParams {
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

export const getVehicleAlerts = async (instance: AxiosInstance, params?: VehicleAlertsParams) => {
	try {
		const defaultRange = getDefaultDateRange();
		const queryParams = {
			start: params?.start || defaultRange.start,
			end: params?.end || defaultRange.end,
			...(params?.vehicle_ids && { vehicle_ids: params.vehicle_ids }),
		};

		const response = await instance.get<GeneralResponse<VehicleAlertData[]>>(
			"/kpi/alert/percentage",
			{ params: queryParams }
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener las alertas por vehículo");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
