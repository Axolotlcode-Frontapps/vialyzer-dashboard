import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { FileDown } from "lucide-react";

import "@/ui/monitoring/page.css";

import { GoogleMapsProvider } from "@/contexts/maps";

import { movilitySchemas } from "@/lib/schemas/movility";
import { GraphAgentStatus } from "@/ui/monitoring/graph-agent-status";
import { GraphTime } from "@/ui/monitoring/graph-time";
import { GraphTopReasons } from "@/ui/monitoring/graph-top-reasons";
import { GraphVehicleAlert } from "@/ui/monitoring/graph-vehicle-alert";
import { GraphVolumeHour } from "@/ui/monitoring/graph-volume-hour";
import { Notifications } from "@/ui/monitoring/notifications";
import { Stats } from "@/ui/monitoring/stats";
import { Button } from "@/ui/shared/button";
import { Maps } from "@/ui/shared/maps";
import { MapDetails } from "@/ui/shared/maps/map-details";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/monitoring/$cameraId")({
	component: Monitoring,
	validateSearch: zodValidator(movilitySchemas.filters),
});

function Monitoring() {
	const { cameraId } = Route.useParams();

	console.log(cameraId);

	return (
		<div className="monitoring">
			<div className="flex items-center justify-between mb-5">
				<h1 className="text-2xl font-bold">Monitoring</h1>
				<Button size="sm">
					<FileDown className="size-4" />
					Descargar reporte
				</Button>
			</div>
			<div className="monitoring__content">
				<HasPermission moduleBase="kpis" permissionName="dashboard-kpis">
					<Stats />
				</HasPermission>
				<Notifications />
				<div className="monitoring__map">
					<div className="h-[400px] @5xl/graphs:h-full">
						<GoogleMapsProvider>
							<Maps />
						</GoogleMapsProvider>
						<MapDetails />
					</div>
				</div>
				{/* Graphs */}
				<div className="monitoring__graph monitoring__graph--agents">
					<GraphAgentStatus />
				</div>
				<div className="monitoring__graph monitoring__graph--alerts">
					<GraphVehicleAlert />
				</div>
				<div className="monitoring__graph monitoring__graph--time">
					<GraphTime />
				</div>
				<div className="monitoring__graph monitoring__graph--rejects">
					<GraphTopReasons />
				</div>
				<div className="monitoring__graph monitoring__graph--volume">
					<GraphVolumeHour />
				</div>
			</div>
		</div>
	);
}
