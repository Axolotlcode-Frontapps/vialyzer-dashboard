import type { AxiosInstance } from "axios";
import type { GraphFilters, VolumeTable } from "@/types/movility";

export async function getVolumeTable(
	instance: AxiosInstance,
	project: string,
	camera: string,
	filters: GraphFilters
) {
	try {
		const response = await instance.post<GeneralResponse<VolumeTable>>(
			"/data-sources/get-volumen-table",
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
			throw new Error("Error al obtener los datos la tabla de volumen");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
