import type { UpdatePasswordValues } from "../schemas/auth";
import type { UpdateProfileValues } from "../schemas/profile";
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

		return await fetcher<GeneralResponse<User>>(`/users/update-user/${id}`, {
			method: "PATCH",
			data: { ...rest, idRole: role, idCompany: company },
		});
	}

	async updateCurrentUser(values?: UpdatePasswordValues) {
		const { password } = values ?? {};

		return await fetcher<GeneralResponse<User>>(`/users/update`, {
			method: "PUT",
			data: {
				...(password ? { password } : {}),
				firstLogin: false,
			},
		});
	}

	async updateUserProfile(values: UpdateProfileValues) {
		return await fetcher<GeneralResponse<User>>(`/users/update`, {
			method: "PUT",
			data: values,
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
