import type { CompanyValues } from "@/lib/schemas/settings";

import { fetcher } from "@/lib/utils/fetch-api";

class CompaniesService {
	async getAllCompanies() {
		const res = await fetcher<GeneralResponse<Company[]>>("/companies/get-all");
		return res;
	}

	async createCompany(values: CompanyValues) {
		const res = await fetcher<GeneralResponse<Company>>("/companies/create", {
			method: "POST",
			data: values,
		});
		return res;
	}

	async updateCompany(id: string, values: CompanyValues) {
		const res = await fetcher<GeneralResponse<Company>>(
			`/companies/update/${id}`,
			{
				method: "PUT",
				data: values,
			}
		);
		return res;
	}

	async deleteCompany(id: string) {
		const res = await fetcher<GeneralResponse<Company>>(
			`/companies/delete/${id}`,
			{
				method: "DELETE",
				data: { id },
			}
		);
		return res;
	}
}

export const companiesService = new CompaniesService();
