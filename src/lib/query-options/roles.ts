import { queryOptions } from "@tanstack/react-query";

import { rolesService } from "@/lib/services/roles";

class RolesQueries {
	rolesOptions() {
		return queryOptions({
			queryKey: ["roles"],
			queryFn: async () => await rolesService.getAllRoles(),
		});
	}
}

export const rolesQueries = new RolesQueries();
