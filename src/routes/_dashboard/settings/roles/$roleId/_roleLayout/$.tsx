import { createFileRoute } from "@tanstack/react-router";

import { PermissionsTable } from "@/ui/roles/permissions-table";

export const Route = createFileRoute(
	"/_dashboard/settings/roles/$roleId/_roleLayout/$"
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <PermissionsTable />;
}
