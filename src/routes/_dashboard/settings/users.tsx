import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";

import { sharedSchemas } from "@/lib/schemas/shared";
import { usersService } from "@/lib/services/users";
import { hasModule } from "@/lib/utils/permissions";
import { UserAdd } from "@/ui/settings/users/user-add";
import { useUsersColumns } from "@/ui/settings/users/users-table/columns";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/settings/users")({
	component: Users,
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

		const hasRoleModule = hasModule("usuarios", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Users() {
	const columns = useUsersColumns();

	const { data: usersData = [], isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => await usersService.getAllUsers(),
		select: (data) => data.payload,
	});

	return (
		<div className="space-y-4 w-full">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl lg:text-2xl font-medium">Usuarios</h2>
				<HasPermission moduleBase="users" permissionName="create">
					<UserAdd />
				</HasPermission>
			</div>

			<DataTable
				columns={columns}
				data={usersData}
				isLoading={isLoading}
				totalRows={usersData.length}
			>
				{({ table }) => (
					<DataTableHeader
						hasSearchUrl
						table={table}
						searchBy="name"
						searchPlaceholder="Busqueda por nombre"
					/>
				)}
			</DataTable>
		</div>
	);
}
