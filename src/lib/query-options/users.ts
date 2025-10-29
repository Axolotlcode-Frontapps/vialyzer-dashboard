import { queryOptions } from "@tanstack/react-query";

import { usersService } from "../services/users";

class UsersQueries {
	usersOptions() {
		return queryOptions({
			queryKey: ["users"],
			queryFn: async () => await usersService.getAllUsers(),
		});
	}
}

export const usersQueries = new UsersQueries();
