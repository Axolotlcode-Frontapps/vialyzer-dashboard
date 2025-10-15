import type { AxiosInstance } from "axios";
import type { GraphFilters, VehicleCount } from "@/types/movility";

export async function getVehicleCount(
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) {
	try {
		const response = await instance.post<GeneralResponse<VehicleCount>>(
			"/data-sources/get-data-volumen-by-last-day-hours",
			{
				projectId: project,
				cameraId: camera,
				...filters,
			},
			{
				timeout: 60000, // 60 seconds timeout
			}
		);

		if (response.status !== 200) {
			throw new Error(
				"Error al obtener los datos de vehículos por intervalos de 15 minutos"
			);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
