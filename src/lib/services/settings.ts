import { fetcher } from "@/lib/utils/fetch-api";

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

export interface VehicleLine {
	id: string;
	name: string;
	model_id: number;
	color: [number, number, number];
	active: boolean;
}

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

export interface IdLine {
	id: string;
}

class SettingsService {
	async getScenarioLines(): Promise<SourceLine[]> {
		const response = await fetcher<SourceLine[]>("/data-sources/get-all");

		return response;
	}

	async loadVehicles(): Promise<VehicleLine[]> {
		try {
			const response =
				await fetcher<GeneralResponse<VehicleLine[]>>("/vehicles/get-all");

			return response.payload ?? [];
		} catch {
			return [];
		}
	}

	async addScenarioLine(data: CreateScenarioLineBody) {
		const response = await fetcher<IdLine>("/scenarios/create", {
			data,
			method: "POST",
		});

		return response;
	}

	async addDatasource(data: CreateDatasourceBody) {
		const response = await fetcher("/data-sources/create", {
			data,
			method: "POST",
		});

		return response;
	}

	async updateScenarioLine(data: CreateScenarioLineBody, id: string) {
		const response = await fetcher<IdLine>(`/scenarios/put/${id}`, {
			data,
			method: "PUT",
		});

		return response;
	}

	async updateDatasource(data: CreateDatasourceBody, id: string) {
		const response = await fetcher<IdLine>(`/data-sources/update/${id}`, {
			data,
			method: "PUT",
		});

		return response;
	}

	async removeDatasource(body: IdLine) {
		const response = await fetcher(`/data-sources/delete/${body.id}`, {
			method: "DELETE",
		});

		return response;
	}

	async removeScenarioLine(body: IdLine) {
		const response = await fetcher(`/scenarios/delete/${body.id}`, {
			method: "DELETE",
		});

		return response;
	}
}

export const settings = new SettingsService();
