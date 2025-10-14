import type { AxiosInstance } from "axios";
import type { Scenario } from "@/types/movility";

export const getScenarios = async (instance: AxiosInstance) => {
	try {
		const response =
			await instance.get<GeneralResponse<Scenario[]>>("/scenarios/get-all");

		if (response.status !== 200) {
			throw new Error("Error al obtener los escenarios");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
