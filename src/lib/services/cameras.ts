import { fetcher } from "../utils/fetch-api";

class CamerasService {
	async getAllCameras() {
		return await fetcher<GeneralResponse<Camera[]>>("/cameras/get-all");
	}
}

export const camerasService = new CamerasService();
