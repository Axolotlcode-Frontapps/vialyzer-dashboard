import { useQuery } from "@tanstack/react-query";

import { modulesServices } from "@/lib/services/modules";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function ModulesTable() {
	const { data: modules } = useQuery({
		queryKey: ["modules"],
		queryFn: async () => await modulesServices.getAllModules(),
		select: (data) => data.payload,
	});

	return (
		<DataTable
			columns={columns}
			data={modules || []}
			isLoading={!modules}
			totalRows={modules ? modules.length : 0}
		>
			{({ table }) => (
				<DataTableHeader
					table={table}
					searchBy="name"
					searchPlaceholder="Busqueda por nombre..."
				/>
			)}
			{/* <Button
        disabled={selectedPermissionsIds.length === 0}
        onClick={() => updatePermissionsMutation.mutate()}
      >
        {action} permisos
      </Button>
    </DataTableHeader> */}
		</DataTable>
	);
}
