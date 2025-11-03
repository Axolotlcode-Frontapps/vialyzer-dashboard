import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { sharedSchemas } from "@/lib/schemas/shared";
import { UserAdd } from "@/ui/users/user-add";
import { UsersTable } from "@/ui/users/users-table";

export const Route = createFileRoute("/_dashboard/settings/users")({
	component: Users,
	validateSearch: zodValidator(sharedSchemas.genericTableSearchSchema),
});

function Users() {
	return (
		<div className="space-y-4 w-full">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl lg:text-2xl font-medium">Usuarios</h2>
				<UserAdd />
			</div>

			<UsersTable />
		</div>
	);
}
