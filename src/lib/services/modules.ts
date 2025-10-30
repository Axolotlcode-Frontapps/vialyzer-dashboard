import { fetcher } from "../utils/fetch-api";

class ModulesServices {
	async getAllModules() {
		return await fetcher<GeneralResponse<Module[]>>("/cat-modules/get-all");
	}
}

export const modulesServices = new ModulesServices();
