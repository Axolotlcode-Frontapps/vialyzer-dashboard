import { createFileRoute } from "@tanstack/react-router";

import { Graph15Minutes } from "@/ui/movility/graph-15-minutes";
import { GraphDistribution } from "@/ui/movility/graph-distribution";
import { GraphVehiclesDaily } from "@/ui/movility/graph-vehicles-daily";
import { Snapshot } from "@/ui/movility/snapshot";
import { VolumeTable } from "@/ui/movility/volume-table";
import { HasMultiplePermissions, HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/movility/$camera/volume")({
	component: Volume,
});

function Volume() {
	return (
		<div className="flex flex-col w-full @container/volume gap-6">
			<HasMultiplePermissions
				moduleBase="kpis"
				permissionNames={["get-traffic-total-volume", "get-vehicles-distribution"]}
			>
				<div className="w-full grid grid-cols-1 gap-4 md:gap-5">
					<GraphDistribution />
				</div>
			</HasMultiplePermissions>

			<Snapshot />

			<HasPermission moduleBase="kpis" permissionName="get-volume-table">
				<VolumeTable />
			</HasPermission>
			<HasPermission moduleBase="kpis" permissionName="get-daily-vehicule-for-month">
				<GraphVehiclesDaily />
			</HasPermission>
			<HasPermission moduleBase="kpis" permissionName="get-data-volumen-by-last-day-hours">
				<Graph15Minutes />
			</HasPermission>
		</div>
	);
}
