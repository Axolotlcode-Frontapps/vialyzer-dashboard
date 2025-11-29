import { createFileRoute } from "@tanstack/react-router";

import { GraphAverageSpeed } from "@/ui/movility/graph-average-speed";
import { GraphVehiclesSpeed } from "@/ui/movility/graph-vehicles-speed";
import { GraphVehiclesSpeedHour } from "@/ui/movility/graph-vehicles-speed-hour";
import { VelocityTable } from "@/ui/movility/velocity-table";

export const Route = createFileRoute("/_dashboard/movility/$camera/velocity")({
	component: Velocity,
});

function Velocity() {
	return (
		<div className="flex flex-col w-full items-stretch justify-start @container/velocity gap-6">
			<div className="w-full flex flex-col @md/velocity:flex-row @4xl/velocity:grid @4xl/velocity:grid-cols-[30%_calc(70%-1.25rem)] gap-4 md:gap-5">
				<GraphAverageSpeed />
				<GraphVehiclesSpeedHour />
			</div>
			<VelocityTable />

			<GraphVehiclesSpeed />
		</div>
	);
}
