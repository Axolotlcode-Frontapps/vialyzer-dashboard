import { queryOptions } from "@tanstack/react-query";

import { companiesService } from "../services/companies";
import { QueryKeys } from "../utils/enums";

class CompaniesQueries {
	companiesOptions() {
		return queryOptions({
			queryKey: [QueryKeys.GET_COMPANIES],
			queryFn: async () => await companiesService.getAllCompanies(),
		});
	}
}

export const companiesQueries = new CompaniesQueries();
