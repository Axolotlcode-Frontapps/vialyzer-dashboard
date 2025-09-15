import type { CompanyValues, RoleValues, UserValues } from "../schemas/settings";

import { fetcher } from "@/lib/utils/fetch-api";

class SettingsServices {
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

	async getAllUsers() {
		return await fetcher<GeneralResponse<User[]>>("/users/get-all");
	}

	async createUser(values: UserValues) {
		const { lastname, ...rest } = values;
		const parseData = {
			...rest,
			lastName: lastname,
		};

		return await fetcher<GeneralResponse<User>>("/users/create", {
			method: "POST",
			data: parseData,
		});
	}

	async updateUser(id: string, values: UserValues) {
		return await fetcher<GeneralResponse<User>>(`users/update-user?userId=${id}`, {
			method: "PATCH",
			data: { ...values },
		});
	}

	async deleteUser(id: string) {
		return await fetcher<GeneralResponse<User>>(`/users/delete`, {
			method: "DELETE",
			data: { id },
		});
	}

	async getAllCompanies() {
		return await fetcher<GeneralResponse<Company[]>>("/companies/get-all");
	}

	async createCompany(values: CompanyValues) {
		return await fetcher<GeneralResponse<Company>>("/companies/create", {
			method: "POST",
			data: {
				...values,
				active: true,
			},
		});
	}

	async updateCompany(id: string, values: CompanyValues) {
		return await fetcher<GeneralResponse<Company>>(`/companies/update?companyId=${id}`, {
			method: "PUT",
			data: { ...values, active: true },
		});
	}

	async deleteCompany(id: string) {
		return await fetcher<GeneralResponse<Company>>(`/companies/delete?companyId=${id}`, {
			method: "DELETE",
			data: { id },
		});
	}
}

export const settingsService = new SettingsServices();
