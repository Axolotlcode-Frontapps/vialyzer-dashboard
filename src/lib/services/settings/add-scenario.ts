import type { AxiosInstance } from "axios";

export interface LineElement {
	id: string;
	name: string;
	description: string;
	coordinates: [number, number][];
	detection_entry: [number, number][];
	detection_exit: [number, number][];
	distance: number;
	color: [number, number, number];
	maps_coordinates: [number, number];
	location: string;
	type: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
	visibility: boolean;
	allowed_directions: string;
	visual_coordinates: {
		layer_id: string;
		// group_id: string;
		type: string;
		fontSize: number;
		fontFamily: string;
		backgroundColor?: string;
		backgroundOpacity: number;
		coordinates: [number, number][];
	};
	layer: {
		id: string;
		name: string;
		description?: string;
		category: string;
	};
}

export interface CreateScenarioLineBody {
	name: string;
	description: string;
	coordinates: [number, number][];
	distance: number;
	color: [number, number, number];
	maps_coordinates: [number, number];
	location: string;
	type: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
	visibility: boolean;
	allowed_directions: string;
}

export interface CreateDatasourceBody {
	scenery_id: string;
	vehicle_id: string;
	description?: string;
	second_scenery?: string;
	visual_coordinates?: LineElement["visual_coordinates"];
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

export async function addDatasource(
	instance: AxiosInstance,
	body: CreateDatasourceBody
) {
	try {
		const response = await instance.post("/datasources/create", body);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error creating datasource: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to create datasource: ${error.message}`);
		}
		throw new Error(`Failed to create datasource: ${String(error)}`);
	}
}
