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
		const { lastname, ...rest } = values;
		const parseData = {
			...rest,
			lastName: lastname,
		};
		return await fetcher<GeneralResponse<User>>("/users/create", {
			method: "POST",
			data: { ...parseData },
		});
	}

	async updateUser(id: string, values: UserValues) {
		const { role, company, ...rest } = values;
		const parseData = {
			...rest,
			idRole: role,
			idCompany: company,
		};
		return await fetcher<GeneralResponse<User>>(`/users/update-user/${id}`, {
			method: "PATCH",
			data: { ...parseData },
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
