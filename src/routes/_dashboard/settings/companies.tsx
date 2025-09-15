import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { genericTableSearchSchema } from "@/lib/schemas/table";
import { CompaniesTable } from "@/ui/companies/companies-table";
import { CompanyAdd } from "@/ui/companies/company-add";

export const Route = createFileRoute("/_dashboard/settings/companies")({
	component: Companies,
	validateSearch: zodValidator(genericTableSearchSchema),
});

function Companies() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl lg:text-2xl font-medium">Empresas</h2>
				<CompanyAdd />
			</div>

			<CompaniesTable />
		</div>
	);
}
