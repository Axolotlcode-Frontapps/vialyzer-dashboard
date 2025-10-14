import type { AxiosInstance } from "axios";
import type { Location } from "@/types/movility";

export const getCameras = async (instance: AxiosInstance) => {
	try {
		const response =
			await instance.get<GeneralResponse<Location[]>>("/cameras/get-all");

		if (response.status !== 200) {
			throw new Error("Error al obtener las camaras");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
