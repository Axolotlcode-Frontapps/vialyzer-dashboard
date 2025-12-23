import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useAgents } from "@/hooks/use-agents";

import { sharedSchemas } from "@/lib/schemas/shared";
import { hasModule } from "@/lib/utils/permissions";
import { AgentAdd } from "@/ui/settings/agents/agent-add";
import { useAgentsColumns } from "@/ui/settings/agents/agents-table/columns";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/settings/agents")({
	component: Agents,
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

		const hasRoleModule = hasModule("configuracion-agentes", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Agents() {
	const columns = useAgentsColumns();

	const { agents, loading } = useAgents();

	return (
		<div className="space-y-4 w-full @container/page container mx-auto">
			<div className="flex items-center justify-between gap-4 mb-4">
				<h2 className="text-xl lg:text-2xl font-medium">Agentes</h2>
				<HasPermission moduleBase="agents" permissionName="create-user-agent">
					<AgentAdd />
				</HasPermission>
			</div>

			<DataTable columns={columns} data={agents} isLoading={loading} totalRows={agents.length}>
				{({ table }) => (
					<DataTableHeader
						hasSearchUrl
						table={table}
						searchBy="user.name"
						searchPlaceholder="Busqueda por nombre"
					/>
				)}
			</DataTable>
		</div>
	);
}
