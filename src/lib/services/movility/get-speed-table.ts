import type { AxiosInstance } from "axios";
import type { GraphFilters, SpeedTable } from "@/types/movility";

export const getSpeedTable = async (
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) => {
	try {
		const response = await instance.post<GeneralResponse<SpeedTable>>(
			"/data-sources/get-vehicle-scenario-speed-matrix",
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
			throw new Error("Error al obtener los datos de la tabla de velocidad");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
