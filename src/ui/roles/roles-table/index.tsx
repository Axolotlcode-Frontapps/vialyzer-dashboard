import { useQuery } from "@tanstack/react-query";

import { rolesQueries } from "@/lib/query-options/roles";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function RolesTable() {
	const { data: rolesData = [], isLoading } = useQuery({
		...rolesQueries.rolesOptions(),
		select: (data) => data.payload,
	});

	return (
		<DataTable columns={columns} data={rolesData} isLoading={isLoading}>
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
