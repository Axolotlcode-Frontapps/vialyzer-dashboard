import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { modulesServices } from "@/lib/services/modules";
import { permissionsServices } from "@/lib/services/permissions";
import { Badge } from "@/ui/shared/badge";

export const Route = createFileRoute("/_dashboard/settings/roles/$roleId/")({
	component: Permissions,
	beforeLoad: async ({ context: { queryClient } }) => {
		const modules = queryClient.ensureQueryData({
			queryKey: ["modules"],
			queryFn: async () => await modulesServices.getAllModules(),
		});

		console.log(modules);
	},
});

function Permissions() {
	const { data: modules } = useQuery({
		queryKey: ["modules"],
		queryFn: async () => await modulesServices.getAllModules(),
		select: (data) => data.payload,
	});

	const { data: permissions } = useQuery({
		queryKey: ["permissions"],
		queryFn: async () => await permissionsServices.getAllPermissions(),
		select: (data) => data.payload,
	});

	return (
		<div>
			<div>
				{modules?.map((module) => (
					<Badge
						variant="secondary"
						key={module.id}
						className="capitalize px-3 py-1.5"
					>
						{module.name}
					</Badge>
				))}
			</div>
			<div>
				{permissions?.map((permission) => (
					<Badge
						variant="outline"
						key={permission.id}
						className="capitalize px-3 py-1.5"
					>
						{permission.module} - {permission.action}
					</Badge>
				))}
			</div>
		</div>
	);
}
