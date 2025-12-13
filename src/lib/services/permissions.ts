import { fetcher } from "../utils/fetch-api";

class PermissionsServices {
	async getAllPermissions() {
		return await fetcher<GeneralResponse<Permission[]>>("/permissions/get-owner-permissions");
	}
}

export const permissionsServices = new PermissionsServices();
