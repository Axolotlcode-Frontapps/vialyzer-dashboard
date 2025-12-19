import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { SearchIcon } from "lucide-react";
import { GoogleMapsProvider } from "@/contexts/maps";

import { movilitySchemas } from "@/lib/schemas/movility";
import { hasModule } from "@/lib/utils/permissions";
import { DetailsCard } from "@/ui/movility/details-card";
import { LocationFilter } from "@/ui/movility/location-filter";
import { Locations } from "@/ui/movility/locations";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/shared/input-group";
import { Maps } from "@/ui/shared/maps";

export const Route = createFileRoute("/_dashboard/movility/")({
	component: Mobility,
	validateSearch: zodValidator(movilitySchemas.filters),
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

		const hasRoleModule = hasModule("movilidad", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Mobility() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	function handleSearchChange(newValue: string) {
		navigate({
			search: {
				...search,
				search: newValue === "" ? undefined : newValue,
			},
		});
	}
	return (
		<div className="w-full mx-auto py-8 container @container/page">
			<h1 className="text-3xl font-bold">Mapa de Puntos de Monitoreo</h1>
			<p className="text-muted-foreground mb-4 text-lg">
				Mapa de puntos de monitoreo en tiempo real
			</p>

			<div className="bg-card rounded-2xl shadow-xl p-6 grid grid-cols-1 grid-rows-[auto_600px] @3xl/page:flex gap-8">
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

				<section className="@container/map flex-1 relative min-h-[600px] rounded-2xl overflow-hidden bg-card flex items-center justify-center shadow-lg">
					<GoogleMapsProvider>
						<Maps heatmap={false} />
					</GoogleMapsProvider>
					<DetailsCard />
				</section>
			</div>
		</div>
	);
}
