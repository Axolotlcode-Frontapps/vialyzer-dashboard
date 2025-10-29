import type { CompanyValues } from "@/lib/schemas/settings";

import { fetcher } from "@/lib/utils/fetch-api";

class CompaniesService {
	async getAllCompanies() {
		return await fetcher<GeneralResponse<Company[]>>("/companies/get-all");
	}

	async createCompany(values: CompanyValues) {
		return await fetcher<GeneralResponse<Company>>("/companies/create", {
			method: "POST",
			data: {
				...values,
				active: true,
			},
		});
	}

	async updateCompany(id: string, values: CompanyValues) {
		return await fetcher<GeneralResponse<Company>>(`/companies/update/${id}`, {
			method: "PUT",
			data: { ...values, active: true },
		});
	}

	async deleteCompany(id: string) {
		return await fetcher<GeneralResponse<Company>>(`/companies/delete/${id}`, {
			method: "DELETE",
			data: { id },
		});
	}
}

export const companiesService = new CompaniesService();
