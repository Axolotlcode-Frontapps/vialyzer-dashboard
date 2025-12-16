import { createFileRoute } from "@tanstack/react-router";

import { GraphAverageSpeed } from "@/ui/movility/graph-average-speed";
import { GraphVehiclesSpeed } from "@/ui/movility/graph-vehicles-speed";
import { GraphVehiclesSpeedHour } from "@/ui/movility/graph-vehicles-speed-hour";
import { Snapshot } from "@/ui/movility/snapshot";
import { VelocityTable } from "@/ui/movility/velocity-table";
import { HasAnyPermissions, HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/movility/$camera/velocity")({
	component: Velocity,
});

function Velocity() {
	return (
		<div className="flex flex-col w-full items-stretch justify-start @container/velocity gap-6">
			<HasAnyPermissions
				moduleBase="kpis"
				permissionNames={["get-average-speed", "get-average-speed-by-hour"]}
			>
				<div className="w-full flex flex-col @md/velocity:flex-row @4xl/velocity:grid @4xl/velocity:grid-cols-[30%_calc(70%-1.25rem)] gap-4 md:gap-5">
					<HasPermission moduleBase="kpis" permissionName="get-average-speed">
						<GraphAverageSpeed />
					</HasPermission>
					<HasPermission moduleBase="kpis" permissionName="get-average-speed-by-hour">
						<GraphVehiclesSpeedHour />
					</HasPermission>
				</div>
			</HasAnyPermissions>
			<Snapshot />
			<HasPermission moduleBase="kpis" permissionName="get-vehicle-scenario-speed-matrix">
				<VelocityTable />
			</HasPermission>
			<HasPermission moduleBase="kpis" permissionName="get-graphic-km-promedy">
				<GraphVehiclesSpeed />
			</HasPermission>
		</div>
	);
}
