import { useQuery } from "@tanstack/react-query";

import { companiesQueries } from "@/lib/query-options/companies";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function CompaniesTable() {
	const { data: companiesData = [], isLoading } = useQuery({
		...companiesQueries.companiesOptions(),
		select: (data) => data.payload,
	});

	return (
		<DataTable columns={columns} data={companiesData} isLoading={isLoading}>
			{({ table }) => (
				<DataTableHeader
					table={table}
					searchBy="name"
					searchPlaceholder="Busqueda por nombre"
				/>
			)}
		</DataTable>
	);
}
