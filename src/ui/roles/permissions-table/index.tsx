import { useQuery } from "@tanstack/react-query";

import { permissionsServices } from "@/lib/services/permissions";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function PermissionsTable() {
	const { data: permissions = [], isLoading } = useQuery({
		queryKey: ["permissions"],
		queryFn: async () => await permissionsServices.getAllPermissions(),
		select: (data) => data.payload,
	});

	return (
		<DataTable
			columns={columns}
			data={permissions}
			isLoading={isLoading}
			totalRows={permissions.length}
		>
			{({ table }) => (
				<DataTableHeader
					table={table}
					searchBy="action"
					searchPlaceholder="Busqueda por acción..."
				/>
			)}
		</DataTable>
	);
}
