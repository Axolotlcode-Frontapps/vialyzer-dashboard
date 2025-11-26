interface Camera {
	id: string;
	name: string;
	externalId: string;
	state: TCameraStatus;
	location: {
		latitude: string;
		longitude: string;
		timezone: string;
	};
	createdAt: string;
	updatedAt: string;
	project: {
		id: string;
		name: string;
		externalId: string;
		createdAt: string;
		updatedAt: string;
	};
}

interface CameraScenario {
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

interface CameraVehicle {
	id: string;
	name: string;
	model_id: number;
	color: [number, number, number];
	active: boolean;
}
