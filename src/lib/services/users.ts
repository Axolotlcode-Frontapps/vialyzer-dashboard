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
			data: parseData,
		});
	}

	async updateUser(id: string, values: UserValues) {
		return await fetcher<GeneralResponse<User>>(
			`users/update-user?userId=${id}`,
			{
				method: "PATCH",
				data: { ...values },
			}
		);
	}

	async deleteUser(id: string) {
		return await fetcher<GeneralResponse<User>>(`/users/delete`, {
			method: "DELETE",
			data: { id },
		});
	}
}

export const usersService = new UsersService();
