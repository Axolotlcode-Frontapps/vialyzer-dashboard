import type { AxiosInstance } from "axios";

export interface CreateScenarioLineBody {
	name: string;
	description: string;
	coordinates: number[][];
	color: [number, number, number];
	maps_coordinates: [number, number];
	location: string;
}

export async function addScenarioLine(
	instance: AxiosInstance,
	body: CreateScenarioLineBody
) {
	try {
		const response = await instance.post("/sceneries/create", body);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error creating scenario line: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to create scenario line: ${error.message}`);
		}
		throw new Error(`Failed to create scenario line: ${String(error)}`);
	}
}
