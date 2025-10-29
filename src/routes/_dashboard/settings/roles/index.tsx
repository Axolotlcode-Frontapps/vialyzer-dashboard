import { createFileRoute } from "@tanstack/react-router";

import { RoleAdd } from "@/ui/roles/role-add";
import { RolesTable } from "@/ui/roles/roles-table";

export const Route = createFileRoute("/_dashboard/settings/roles/")({
	component: Roles,
});

function Roles() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl lg:text-2xl font-medium">Roles</h2>
				<RoleAdd />
			</div>

			<RolesTable />
		</div>
	);
}
