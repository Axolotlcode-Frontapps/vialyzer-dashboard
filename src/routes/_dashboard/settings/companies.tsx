import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";

import { sharedSchemas } from "@/lib/schemas/shared";
import { companiesService } from "@/lib/services/companies";
import { hasModule } from "@/lib/utils/permissions";
import { useCompanyColumns } from "@/ui/settings/companies/companies-table/columns";
import { CompanyAdd } from "@/ui/settings/companies/company-add";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/settings/companies")({
	component: Companies,
	validateSearch: zodValidator(sharedSchemas.genericTableSearchSchema),
	beforeLoad: async ({
		context: {
			permissions: { user },
		},
	}) => {
		if (!user) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const hasRoleModule = hasModule("empresas", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Companies() {
	const columns = useCompanyColumns();
	const { data: companiesData = [], isLoading } = useQuery({
		queryKey: ["companies"],
		queryFn: async () => await companiesService.getAllCompanies(),
		select: (data) => data.payload,
	});

	return (
		<div className="space-y-4 @container/page container mx-auto">
			<div className="flex items-center justify-between gap-4 mb-4">
				<h2 className="text-xl lg:text-2xl font-medium">Empresas</h2>
				<HasPermission moduleBase="companies" permissionName="create">
					<CompanyAdd />
				</HasPermission>
			</div>

			<DataTable columns={columns} data={companiesData} isLoading={isLoading}>
				{({ table }) => (
					<DataTableHeader
						table={table}
						searchBy="name"
						searchPlaceholder="Busqueda por nombre"
						hasSearchUrl
					/>
				)}
			</DataTable>
		</div>
	);
}
