import type { AxiosInstance } from "axios";
import type { CameraScenario } from "@/types/movility";

export const getCameraScenarios = async (
	instance: AxiosInstance,
	camera: string
) => {
	try {
		const response = await instance.get<GeneralResponse<CameraScenario>>(
			`/cameras/get-with-scenarios?cameraId=${camera}`
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener los escenarios");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
