import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";

import { sharedSchemas } from "@/lib/schemas/shared";
import { rolesService } from "@/lib/services/roles";
import { hasModule } from "@/lib/utils/permissions";
import { RoleAdd } from "@/ui/roles/role-add";
import { useRolesColumns } from "@/ui/roles/roles-table/columns";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/settings/roles")({
	component: Roles,
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

		const hasRoleModule = hasModule("roles", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Roles() {
	const columns = useRolesColumns();

	const { data: rolesData = [], isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => await rolesService.getAllRoles(),
		select: (data) => data.payload,
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl lg:text-2xl font-medium">Roles</h2>
				<HasPermission moduleBase="roles" permissionName="create">
					<RoleAdd />
				</HasPermission>
			</div>

			<DataTable columns={columns} data={rolesData} isLoading={isLoading}>
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
