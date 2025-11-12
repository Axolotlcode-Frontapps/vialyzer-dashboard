import type { AssignPermissionsValues } from "../schemas/modules";

import { fetcher } from "../utils/fetch-api";

class ModulesServices {
	async getAllModules() {
		return await fetcher<GeneralResponse<Module[]>>("/cat-modules/get-all");
	}

	async getModuleById(moduleId: string) {
		return await fetcher<GeneralResponse<Module>>(
			`/cat-modules/get-by-id/${moduleId}`
		);
	}

	async createModule(data: Module) {
		return await fetcher<GeneralResponse<Module>>("/cat-modules/create", {
			method: "POST",
			data,
		});
	}

	async updateModule(moduleId: string, data: Module) {
		return await fetcher<GeneralResponse<Module>>(
			`/cat-modules/update/${moduleId}`,
			{
				method: "PUT",
				data,
			}
		);
	}

	async deleteModule(moduleId: string) {
		return await fetcher<GeneralResponse<Module>>(
			`/cat-modules/delete/${moduleId}`,
			{
				method: "DELETE",
			}
		);
	}

	async assignPermissions(moduleId: string, values: AssignPermissionsValues) {
		return await fetcher(`/cat-modules/associate-permissions/${moduleId}`, {
			method: "PUT",
			data: values,
		});
	}
}

export const modulesServices = new ModulesServices();
