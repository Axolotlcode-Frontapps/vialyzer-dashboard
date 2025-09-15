import type { RoleValues } from "../schemas/settings";

import { fetcher } from "@/lib/utils/fetch-api";

class RolesServices {
	async getAllRoles() {
		return await fetcher<GeneralResponse<Role[]>>("/roles/get-all");
	}

	async createRole(values: RoleValues) {
		return await fetcher<GeneralResponse<Role>>("/roles/create", {
			method: "POST",
			data: values,
		});
	}

	async updateRole(id: string, values: RoleValues) {
		return await fetcher<GeneralResponse<Role>>(`/roles/update`, {
			method: "PUT",
			data: { id, ...values },
		});
	}

	async deleteRole(id: string) {
		return await fetcher<GeneralResponse<Role>>(`/roles/delete`, {
			method: "DELETE",
			data: { id },
		});
	}
}

export const rolesService = new RolesServices();
