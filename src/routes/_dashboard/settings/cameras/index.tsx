import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { SearchIcon } from "lucide-react";
import { GoogleMapsProvider } from "@/contexts/maps";

import { settingsSchemas } from "@/lib/schemas/settings";
import { DetailsCard } from "@/ui/settings/details-card";
import { LocationFilter } from "@/ui/settings/location-filter";
import { Locations } from "@/ui/settings/locations";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/ui/shared/input-group";
import { Maps } from "@/ui/shared/maps";
import { MapLegend } from "@/ui/shared/maps/map-legend";

export const Route = createFileRoute("/_dashboard/settings/cameras/")({
	component: Cameras,
	validateSearch: zodValidator(settingsSchemas.cameras),
});

function Cameras() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	function handleSearchChange(newValue: string) {
		navigate({
			...search,
			search: {
				search: newValue === "" ? undefined : newValue,
			},
		});
	}
	return (
		<section className="container mx-auto py-8 @container/page">
			<h1 className="text-3xl font-bold mb-8">Configuración</h1>
			<div className="bg-card rounded-2xl shadow-xl p-6 grid grid-cols-1 grid-rows-[auto_600px] @3xl/page:flex gap-8">
				{/* Sidebar */}
				<section className="w-full @3xl/page:w-96 shrink-0 flex flex-col gap-6">
					<div className="flex flex-col gap-4">
						<InputGroup>
							<InputGroupInput
								type="text"
								value={search.search ?? ""}
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder="Buscar ubicaciones..."
							/>
							<InputGroupAddon>
								<SearchIcon />
							</InputGroupAddon>
						</InputGroup>
						<LocationFilter />
					</div>
					<Locations />
				</section>
				{/* Map Section */}
				<section className="@container/map flex-1 relative min-h-[600px] rounded-2xl overflow-hidden bg-card flex items-center justify-center shadow-lg">
					<GoogleMapsProvider>
						<Maps />
					</GoogleMapsProvider>
					<MapLegend />
					<DetailsCard />
				</section>
			</div>
		</section>
	);
}
