import { queryOptions } from "@tanstack/react-query";

import { rolesService } from "@/lib/services/roles";
import { QueryKeys } from "../utils/enums";

class RolesQueries {
	rolesOptions() {
		return queryOptions({
			queryKey: [QueryKeys.GET_ROLES],
			queryFn: async () => await rolesService.getAllRoles(),
		});
	}
}

export const rolesQueries = new RolesQueries();
