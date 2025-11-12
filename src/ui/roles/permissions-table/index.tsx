import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { modulesServices } from "@/lib/services/modules";
import { permissionsServices } from "@/lib/services/permissions";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { columns } from "./columns";

export function PermissionsTable() {
	const { _splat: moduleId } = useParams({
		from: "/_dashboard/settings/roles/$roleId/_roleLayout/$",
	});

	const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
		queryKey: ["permissions"],
		queryFn: async () => await permissionsServices.getAllPermissions(),
		select: (data) => data.payload,
	});

	const { data: moduleData, isLoading: isLoadingModule } = useQuery({
		queryKey: ["module-by-id", moduleId],
		enabled: !!moduleId,
		queryFn: async () => await modulesServices.getModuleById(moduleId!),
		select: (data) => data.payload,
	});

	const permissionswithAssigned = useMemo(() => {
		if (!moduleData) return permissions;

		return permissions.map((permission) => ({
			...permission,
			assigned: moduleData.permissions.some(
				(modulePermission) => modulePermission.id === permission.id
			),
		}));
	}, [moduleData, permissions]);

	return (
		<DataTable
			columns={columns}
			data={permissionswithAssigned}
			isLoading={isLoadingPermissions || isLoadingModule}
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
