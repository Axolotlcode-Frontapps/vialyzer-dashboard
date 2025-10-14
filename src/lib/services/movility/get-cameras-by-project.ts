import type { AxiosInstance } from "axios";
import type { Location } from "@/types/movility";

export const getCamerasByProject = async (
	instance: AxiosInstance,
	project: string
) => {
	try {
		const response = await instance.get<GeneralResponse<Location[]>>(
			`/cameras/get-by-project?projectId=${project}`
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener las camaras del proyecto");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
