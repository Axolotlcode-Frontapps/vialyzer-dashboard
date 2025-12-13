import { fetcher } from "../utils/fetch-api";

class CamerasService {
	async getAllCameras() {
		return await fetcher<GeneralResponse<Camera[]>>("/cameras/get-all");
	}

	async scenarios(camera: string) {
		return await fetcher<GeneralResponse<CameraScenario[]>>(`/camera/${camera}/scenarios/get-all`);
	}

	async vehicles(camera: string) {
		return await fetcher<GeneralResponse<CameraVehicle[]>>(`/camera/${camera}/vehicles/get-all`);
	}
}

export const camerasService = new CamerasService();
