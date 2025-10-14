import type { AxiosInstance } from "axios";
import type { Vehicle } from "@/types/movility";

export const getVehicles = async (instance: AxiosInstance) => {
	try {
		const response =
			await instance.get<GeneralResponse<Vehicle[]>>("/vehicles/get-all");

		if (response.status !== 200) {
			throw new Error("Error al obtener los vehículos");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
