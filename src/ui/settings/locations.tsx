import { useSearch } from "@tanstack/react-router";
import { Activity, useMemo } from "react";
import { useCameras } from "@/hooks/use-cameras";
import { useSelectedLocation } from "@/hooks/use-selected-location";

import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date-format";
import { STATUS, STATUS_ORDER } from "@/lib/utils/statuses";
import { ScrollArea } from "../shared/scroll-area";

export function Locations() {
	const { cameras, loading } = useCameras();
	const { selected, onSelect } = useSelectedLocation();
	const { search, filter } = useSearch({
		from: "/_dashboard/settings/cameras/",
	});

	const filteredCameras = useMemo(() => {
		return (
			cameras
				.filter((camera) => {
					const matchesSearch = camera.name
						.toLowerCase()
						.includes(search?.toLowerCase() ?? "");

					return matchesSearch;
				})
				.filter((camera) => {
					if (!filter) return true;

					return STATUS_ORDER[filter as keyof typeof STATUS_ORDER].includes(
						camera.state
					);
				}) ?? []
		);
	}, [cameras, search, filter]);

	return (
		<ScrollArea className="max-h-[600px]">
			<ul className="flex-1 mt-4 pr-2">
				<Activity mode={loading && !filteredCameras ? "visible" : "hidden"}>
					<li className="text-center text-muted-foreground text-lg py-12">
						Cargando ubicaciones...
					</li>
				</Activity>

				{filteredCameras.length === 0 && !loading ? (
					<li className="text-center text-muted-foreground text-lg py-12">
						No se encontraron ubicaciones.
					</li>
				) : (
					filteredCameras.map((loc) => (
						<li
							key={loc.id}
							onClick={() => onSelect(loc.id)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onSelect(loc.id);
								}
							}}
							className={cn(
								`cursor-pointer rounded-xl p-5 mb-4 border-2 flex flex-col gap-2 bg-card transition-all duration-150 shadow-sm hover:shadow-lg text-l`,

								selected === loc.id
									? "border-primary ring-2 ring-primary/30 bg-primary/10"
									: (STATUS[loc.state as TCameraStatus] ?? "border-muted")
							)}
						>
							<div className="flex items-center justify-between">
								<span className="font-bold text-lg">{loc.name}</span>
								<span
									className={cn(
										`w-3 h-3 rounded-full inline-block`,
										STATUS[loc.state as TCameraStatus].color
									)}
								/>
							</div>
							<div className="flex flex-col xs:flex-row justify-between text-base text-muted-foreground">
								{/* <span>
									Volumen actual{" "}
									<span className="font-semibold text-foreground">
										{loc.volume.toLocaleString()} v/h
									</span>
								</span> */}
								<span className="text-sm text-muted-foreground flex items-center gap-1">
									Última actualización:{" "}
									<span className="text-foreground text-xs">
										{formatDate(loc.updatedAt)}
									</span>
								</span>
							</div>
						</li>
					))
				)}
			</ul>
		</ScrollArea>
	);
}
