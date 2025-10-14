import type { AxiosInstance } from "axios";
import type { GraphFilters, VehicleDistribution } from "@/types/movility";

export async function getVehiclesDistribution(
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) {
	try {
		const response = await instance.post<
			GeneralResponse<VehicleDistribution[]>
		>(
			"/data-sources/get-vehicles-distribution",
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
			throw new Error("Error al obtener la distribución de vehículos");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
