import type { RoleValues } from "../schemas/settings";

import { fetcher } from "@/lib/utils/fetch-api";

class RolesServices {
	async getAllRoles() {
		const res = await fetcher<GeneralResponse<Role[]>>("/roles/get-all");
		return res ?? [];
	}

	async createRole(values: RoleValues) {
		const res = await fetcher<GeneralResponse<Role>>("/roles/create", {
			method: "POST",
			data: values,
		});
		return res ?? [];
	}

	async updateRole(id: string, values: RoleValues) {
		const res = await fetcher<GeneralResponse<Role>>(`/roles/update`, {
			method: "PUT",
			data: { id, ...values },
		});
		return res ?? [];
	}

	async deleteRole(id: string) {
		const res = await fetcher<GeneralResponse<Role>>(`/roles/delete`, {
			method: "DELETE",
			data: { id },
		});
		return res ?? [];
	}
}

export const rolesService = new RolesServices();
