import type { AxiosInstance } from "axios";
import type { AverageSpeed, GraphFilters } from "@/types/movility";

export async function getAverageSpeed(
	instance: AxiosInstance,
	project: string,
	filters: GraphFilters
) {
	try {
		const response = await instance.post<GeneralResponse<AverageSpeed>>(
			"/data-sources/get-average-speed",
			{
				projectId: project,
				...filters,
			},
			{
				timeout: 60000, // 60 seconds timeout
			}
		);

		if (response.status !== 200) {
			throw new Error(
				"Error al obtener la velocidad promedio de los vehículos"
			);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
