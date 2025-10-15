import type { AxiosInstance } from "axios";
import type { GraphFilters, MonthlyVehicle } from "@/types/movility";

export const getMonthlyVehicle = async (
	instance: AxiosInstance,
	projectId: string,
	filters: GraphFilters
) => {
	try {
		const response = await instance.post<GeneralResponse<MonthlyVehicle>>(
			"/data-sources/get-monthly-vehicle-counts",
			{
				projectId,
				...filters,
			},
			{
				timeout: 60000, // 60 seconds timeout
			}
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener los datos de vehículos mensuales");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
