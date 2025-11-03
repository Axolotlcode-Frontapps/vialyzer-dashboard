import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { modulesServices } from "@/lib/services/modules";
import { PermissionsTable } from "@/ui/roles/permissions-table";
import { Tabs, TabsList, TabsTrigger } from "@/ui/shared/tabs";

export const Route = createFileRoute("/_dashboard/settings/roles/$roleId/")({
	component: Permissions,
});

function Permissions() {
	const { data: modules } = useQuery({
		queryKey: ["modules"],
		queryFn: async () => await modulesServices.getAllModules(),
		select: (data) => data.payload,
	});

	return (
		<>
			<Tabs>
				<TabsList>
					{modules?.map((module) => (
						<TabsTrigger
							key={module.id}
							value={module.name}
							className="capitalize"
						>
							{module.name}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<PermissionsTable />
		</>
	);
}
