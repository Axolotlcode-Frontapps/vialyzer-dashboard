import type { AxiosInstance } from "axios";

export const getProjects = async (instance: AxiosInstance) => {
	try {
		const response =
			await instance.get<GeneralResponse<unknown[]>>("/projects/get-all");

		if (response.status !== 200) {
			throw new Error("Error al obtener los proyectos");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
