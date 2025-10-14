import type { AxiosInstance } from "axios";
import type { GraphFilters, VehiclesSpeedHour } from "@/types/movility";

export const getVehiclesSpeedHour = async (
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) => {
	try {
		const response = await instance.post<GeneralResponse<VehiclesSpeedHour>>(
			"/data-sources/get-average-speed-by-hour",
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
				"Error al obtener los datos de velocidad de los vehículos"
			);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
