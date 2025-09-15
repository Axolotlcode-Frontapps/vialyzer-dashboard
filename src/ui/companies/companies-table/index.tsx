import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/lib/services/settings";
import { QueryKeys } from "@/lib/utils/enums";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function CompaniesTable() {
	const { data: companiesData = [], isLoading } = useQuery({
		queryKey: [QueryKeys.GET_COMPANIES],
		queryFn: async () => await settingsService.getAllCompanies(),
		select: (data) => data.payload,
	});

	return (
		<DataTable columns={columns} data={companiesData} isLoading={isLoading}>
			{({ table }) => (
				<DataTableHeader table={table} searchBy="name" searchPlaceholder="Busqueda por nombre" />
			)}
		</DataTable>
	);
}
