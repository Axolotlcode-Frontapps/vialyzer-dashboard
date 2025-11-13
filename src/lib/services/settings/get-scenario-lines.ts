import type { AxiosInstance } from "axios";
import type { LineElement } from "./add-scenario";

export interface Scenario {
	id: string;
	name: string;
	coordinates: [number, number][];
	distance: number;
	description: string;
	color: [number, number, number];
	maps_coordinates: [number, number];
	location: string;
	type: string;
	createAt: string;
	updateAt: string | null;
	deleteAt: string | null;
	active: boolean;
	visibility: boolean;
	allowed_directions: string;
}

export interface SourceLine {
	id: string;
	scenery: Scenario;
	vehicle: {
		id: string;
		name: string;
		model_id: number;
		color: [number, number, number];
		createAt: string;
		updateAt: string | null;
		deleteAt: string | null;
		active: boolean;
	};
	description: string;
	second_scenery: Scenario | null;
	visual_coordinates: LineElement["visual_coordinates"];
	createAt: string;
	updateAt: string | null;
	deleteAt: string | null;
	active: boolean;
}

export const getScenarioLines = async (
	instance: AxiosInstance
): Promise<GeneralResponse<SourceLine[]>> => {
	try {
		const response =
			await instance.get<GeneralResponse<SourceLine[]>>("/datasources/get");

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
