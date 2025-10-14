import type { AxiosInstance } from "axios";
import type { GraphFilters, VehicleOccurrence } from "@/types/movility";

export const getVehiclesOccurrence = async (
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) => {
	try {
		const response = await instance.post<GeneralResponse<VehicleOccurrence[]>>(
			"/vehicles/get-vehicles-occurrence",
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
			throw new Error("Error al obtener la ocurrencia de vehículos");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
