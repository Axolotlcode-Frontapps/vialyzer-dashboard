import type { AxiosInstance } from "axios";

export interface VehicleLine {
	id: string;
	name: string;
	model_id: number;
	color: [number, number, number];
	active: boolean;
}

export const loadVehicles = async (
	instance: AxiosInstance
): Promise<GeneralResponse<VehicleLine[]>> => {
	try {
		const response =
			await instance.get<GeneralResponse<VehicleLine[]>>("/vehicles/get");

		if (response.status !== 200) {
			throw new Error(`Error fetching scenario lines: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch scenario lines: ${error.message}`);
		}
		throw new Error(`Failed to fetch scenario lines: ${String(error)}`);
	}
};
