import { queryOptions } from "@tanstack/react-query";

import { usersService } from "../services/users";
import { QueryKeys } from "../utils/enums";

class UsersQueries {
	usersOptions() {
		return queryOptions({
			queryKey: [QueryKeys.GET_USERS],
			queryFn: async () => await usersService.getAllUsers(),
		});
	}
}

export const usersQueries = new UsersQueries();
