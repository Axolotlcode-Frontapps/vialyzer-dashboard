import { queryOptions } from "@tanstack/react-query";

import { companiesService } from "../services/companies";

class CompaniesQueries {
	companiesOptions() {
		return queryOptions({
			queryKey: ["companies"],
			queryFn: async () => await companiesService.getAllCompanies(),
		});
	}
}

export const companiesQueries = new CompaniesQueries();
