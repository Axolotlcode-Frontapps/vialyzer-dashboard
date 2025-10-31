import type { UserValues } from "../schemas/settings";

import { fetcher } from "../utils/fetch-api";

class UsersService {
	async getMeUser() {
		return await fetcher<GeneralResponse<User>>("/users/get-me");
	}

	async getAllUsers() {
		return await fetcher<GeneralResponse<User[]>>("/users/get-all");
	}

	async createUser(values: UserValues) {
		return await fetcher<GeneralResponse<User>>("/users/create", {
			method: "POST",
			data: {
				name: values.name,
				lastname: values.lastname,
				email: values.email,
				phone: values.phone,
				role: values.role,
				company: values.company,
			},
		});
	}

	async updateUser(id: string, values: UserValues) {
		return await fetcher<GeneralResponse<User>>(`/users/update-user/${id}`, {
			method: "PATCH",
			data: {
				name: values.name,
				lastname: values.lastname,
				email: values.email,
				phone: values.phone,
				idRole: values.role,
				idCompany: values.company,
			},
		});
	}

	async deleteUser(id: string) {
		return await fetcher<GeneralResponse<User>>(`/users/delete/${id}`, {
			method: "DELETE",
			data: { id },
		});
	}
}

export const usersService = new UsersService();
