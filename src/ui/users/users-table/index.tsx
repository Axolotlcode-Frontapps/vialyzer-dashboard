import { useQuery } from "@tanstack/react-query";

import { usersQueries } from "@/lib/query-options/users";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function UsersTable() {
	const { data: usersData = [], isLoading } = useQuery({
		...usersQueries.usersOptions(),
		select: (data) => data.payload,
	});

	return (
		<DataTable columns={columns} data={usersData} isLoading={isLoading}>
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
