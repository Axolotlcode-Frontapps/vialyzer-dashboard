import type { AxiosInstance } from "axios";
import type { GraphFilters, TrafficTotal } from "@/types/movility";

export async function getTrafficTotal(
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) {
	try {
		const response = await instance.post<GeneralResponse<TrafficTotal>>(
			"/data-sources/get-traffic-total-volume",
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
			throw new Error("Error al obtener los datos de tráfico total");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
