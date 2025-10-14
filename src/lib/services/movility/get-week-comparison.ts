import type { AxiosInstance } from "axios";
import type { GraphWeekFilters, WeeComparison } from "@/types/movility";

export const getWeekComparison = async (
	instance: AxiosInstance,
	projectId: string,
	filters: GraphWeekFilters
) => {
	try {
		const response = await instance.post<GeneralResponse<WeeComparison>>(
			"/data-sources/get-week-weekend-comparison",
			{
				projectId,
				...filters,
			},
			{
				timeout: 60000, // 60 seconds timeout
			}
		);

		if (response.status !== 200) {
			throw new Error(
				"Error al obtener la comparación de semana y fin de semana"
			);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
