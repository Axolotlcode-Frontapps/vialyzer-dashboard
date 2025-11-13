import { useSearch } from "@tanstack/react-router";
import { Activity, useMemo } from "react";
import { useCameras } from "@/hooks/use-cameras";
import { useSelectedLocation } from "@/hooks/use-selected-location";

import { formatDate } from "@/lib/utils/date-format";
import { STATUS } from "@/lib/utils/statuses";
import { ScrollArea } from "../shared/scroll-area";

export function Locations() {
	const { cameras, loading } = useCameras();
	const { selected, onSelect } = useSelectedLocation();
	const { search } = useSearch({ from: "/_dashboard/settings/cameras/" });

	const filteredCameras = useMemo(() => {
		return cameras.filter((camera) => {
			const matchesSearch = camera.name
				.toLowerCase()
				.includes(search?.toLowerCase() ?? "");

			// const filterStatis = camera.

			// console.log(filter);

			// if (filter) {
			// 	return matchesSearch;
			// }
			return matchesSearch;
		});
	}, [cameras, search]);

	return (
		<ScrollArea className="max-h-[600px]">
			<ul className="flex-1 mt-4 pr-2">
				<Activity mode={loading ? "visible" : "hidden"}>
					<li className="text-center text-muted-foreground text-lg py-12">
						Cargando ubicaciones...
					</li>
				</Activity>
				<Activity mode={filteredCameras.length === 0 ? "hidden" : "visible"}>
					{filteredCameras.map((loc) => (
						<li
							key={loc.id}
							onClick={() => onSelect(loc.id)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onSelect(loc.id);
								}
							}}
							className={`cursor-pointer rounded-xl p-5 mb-4 border-2 flex flex-col gap-2 bg-card transition-all duration-150 shadow-sm hover:shadow-lg text-lg
							${
								selected === loc.id
									? "border-primary ring-2 ring-primary/30 bg-primary/10"
									: (STATUS[loc.state] ?? "border-muted")
							}`}
						>
							<div className="flex items-center justify-between">
								<span className="font-bold text-lg">{loc.name}</span>
								<span
									className={`w-3 h-3 rounded-full ${STATUS[loc.state].color} inline-block`}
								/>
							</div>
							<div className="flex flex-col xs:flex-row justify-between text-base text-muted-foreground">
								{/* <span>
                  Volumen actual{' '}
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
					))}
				</Activity>

				<Activity
					mode={loading || filteredCameras.length > 0 ? "hidden" : "visible"}
				>
					<li className="text-center text-muted-foreground text-lg py-12">
						No se encontraron ubicaciones.
					</li>
				</Activity>
			</ul>
		</ScrollArea>
	);
}
