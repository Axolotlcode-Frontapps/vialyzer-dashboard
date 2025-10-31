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
			data: { ...values },
		});
	}

	async updateUser(id: string, values: UserValues) {
		return await fetcher<GeneralResponse<User>>(`/users/update-user/${id}`, {
			method: "PATCH",
			data: { ...values },
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
