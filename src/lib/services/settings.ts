import type { DrawingElementType } from "@/ui/settings/lines/types";

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
		type: DrawingElementType;
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
	camera: string;
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
	camera: string;
	scenery_id: string;
	vehicle_id?: string;
	description?: string;
	second_scenery?: string;
	visual_coordinates?: LineElement["visual_coordinates"];
}

export interface ScenarioCreated {
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
	active: boolean;
	visibility: boolean;
	allowed_directions: string;
}

export interface DataSourceCreated {
	id: string;
	scenery_id: string;
	vehicle_id: string;
	description: string;
	second_scenery: string;
	visual_coordinates: {
		type: string;
		fontSize: number;
		layer_id: string;
		fontFamily: string;
		coordinates: [number, number][];
		backgroundColor: string;
		backgroundOpacity: number;
	};
	createAt: string;
	active: boolean;
}

export interface IdLine {
	id: string;
}

export interface Camera {
	id: string;
	name: string;
	state: string;
	clientZone: string;
	location: {
		latitude: number;
		longitude: number;
		timezone: string;
	};
	mongoHost: string;
	mongoPort: string;
	mongoUsername: string;
	mongoPassword: string;
	mongoDbName: string;
	previewImageUrl: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string;
}

class SettingsService {
	async preview(camera: string) {
		const response = await fetcher<GeneralResponse<Camera>>(
			`/cameras/get-camera/${camera}`
		);

		return response.payload;
	}

	async getScenarioLines(camera: IdLine): Promise<SourceLine[]> {
		try {
			const response = await fetcher<GeneralResponse<SourceLine[]>>(
				`/camera/${camera.id}/data-sources/get-all`
			);

			return response.payload ?? [];
		} catch {
			return [];
		}
	}

	async loadVehicles(camera: IdLine): Promise<VehicleLine[]> {
		try {
			const response = await fetcher<GeneralResponse<VehicleLine[]>>(
				`/camera/${camera.id}/vehicles/get-all`
			);

			return response.payload ?? [];
		} catch {
			return [];
		}
	}

	async addScenarioLine({
		camera,
		...data
	}: CreateScenarioLineBody): Promise<ScenarioCreated | undefined> {
		const response = await fetcher<GeneralResponse<ScenarioCreated>>(
			`/camera/${camera}/scenarios/create`,
			{
				data,
				method: "POST",
			}
		);

		return response.payload;
	}

	async addDatasource({ camera, ...data }: CreateDatasourceBody) {
		const response = await fetcher<GeneralResponse<DataSourceCreated>>(
			`/camera/${camera}/data-sources/create`,
			{
				data,
				method: "POST",
			}
		);

		return response;
	}

	async updateScenarioLine(
		{ camera, ...data }: CreateScenarioLineBody,
		id: string
	) {
		const response = await fetcher<IdLine>(
			`/camera/${camera}/scenarios/update/${id}`,
			{
				data,
				method: "PUT",
			}
		);

		return response;
	}

	async updateDatasource(
		{ camera, ...data }: CreateDatasourceBody,
		id: string
	) {
		const response = await fetcher<IdLine>(
			`/camera/${camera}/data-sources/update/${id}`,
			{
				data,
				method: "PUT",
			}
		);

		return response;
	}

	async removeDatasource(body: IdLine, camera: IdLine) {
		const response = await fetcher(
			`/camera/${camera.id}/data-sources/delete/${body.id}`,
			{
				method: "DELETE",
			}
		);

		return response;
	}

	async removeScenarioLine(body: IdLine, camera: IdLine) {
		const response = await fetcher(
			`/camera/${camera.id}/scenarios/delete/${body.id}`,
			{
				method: "DELETE",
			}
		);

		return response;
	}
}

export const settings = new SettingsService();
