import { useQuery } from "@tanstack/react-query";

import { rolesService } from "@/lib/services/roles";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function RolesTable() {
	const { data: rolesData = [], isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => await rolesService.getAllRoles(),
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
