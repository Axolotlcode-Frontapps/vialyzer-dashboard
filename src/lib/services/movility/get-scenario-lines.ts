import type { AxiosInstance } from "axios";

export interface ScenarioLineResponse {
	id: string;
	name: string;
	coordinates: number[][];
	description: string;
	color: [number, number, number];
	maps_coordinates: [[number, number]];
	location: string;
	active: boolean;
}

export const getScenarioLines = async (
	instance: AxiosInstance
): Promise<GeneralResponse<ScenarioLineResponse[]>> => {
	try {
		const response =
			await instance.get<GeneralResponse<ScenarioLineResponse[]>>(
				"/sceneries/get"
			);

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
