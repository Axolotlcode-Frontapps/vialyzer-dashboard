import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/lib/services/settings";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function UsersTable() {
	const { data: usersData = [], isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => await settingsService.getAllUsers(),
		select: (data) => data.payload,
	});

	return (
		<DataTable columns={columns} data={usersData} isLoading={isLoading}>
			{({ table }) => (
				<DataTableHeader table={table} searchBy="name" searchPlaceholder="Busqueda por nombre" />
			)}
		</DataTable>
	);
}
