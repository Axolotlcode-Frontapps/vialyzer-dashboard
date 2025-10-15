import type { AxiosInstance } from "axios";
import type { DailyVehicle, GraphDailyFilters } from "@/types/movility";

export async function getDailyVehicle(
	instance: AxiosInstance,
	projectId: string,
	cameraId: string,
	filters: GraphDailyFilters
) {
	try {
		const response = await instance.post<GeneralResponse<DailyVehicle>>(
			"/data-sources/get-daily-vehicule-for-month",
			{
				projectId,
				cameraId,
				...filters,
			},
			{
				timeout: 60000, // 60 seconds timeout
			}
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener los datos de vehículos diarios");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
