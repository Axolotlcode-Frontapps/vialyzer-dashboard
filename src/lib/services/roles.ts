import type {
	AssignModuleValues,
	ModuleValues,
	RoleValues,
} from "../schemas/roles";

import { fetcher } from "@/lib/utils/fetch-api";

class RolesServices {
	async createModule(values: ModuleValues) {
		return await fetcher<GeneralResponse<Role>>("/cat-modules/create", {
			method: "POST",
			data: values,
		});
	}

	async updateModule(id: string, values: ModuleValues) {
		return await fetcher<GeneralResponse<Role>>(`/cat-modules/update/${id}`, {
			method: "PUT",
			data: values,
		});
	}

	async deleteModule(id: string) {
		return await fetcher<GeneralResponse<Role>>(`/cat-modules/delete/${id}`, {
			method: "DELETE",
		});
	}

	async getAllRoles() {
		return await fetcher<GeneralResponse<Role[]>>("/roles/get-all");
	}

	async getRoleById(roleId: string) {
		return await fetcher<GeneralResponse<Role>>(`/roles/get-by-id/${roleId}`);
	}

	async createRole(values: RoleValues) {
		return await fetcher<GeneralResponse<Role>>("/roles/create", {
			method: "POST",
			data: values,
		});
	}

	async updateRole(id: string, values: RoleValues) {
		return await fetcher<GeneralResponse<Role>>(`/roles/update/${id}`, {
			method: "PUT",
			data: values,
		});
	}

	async deleteRole(id: string) {
		return await fetcher<GeneralResponse<Role>>(`/roles/delete/${id}`, {
			method: "DELETE",
		});
	}

	async assignModulesToRole(roleId: string, values: AssignModuleValues) {
		return await fetcher<GeneralResponse<Role>>(
			`/roles/associate-modules/${roleId}`,
			{
				method: "PUT",
				data: values,
			}
		);
	}
}

export const rolesService = new RolesServices();
