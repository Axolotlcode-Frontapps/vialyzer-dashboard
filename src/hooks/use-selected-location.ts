import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";

import { useCameras } from "./use-cameras";

const Route = getRouteApi("/_dashboard/movility/");

export function useSelectedLocation() {
	const { cameras } = useCameras();
	const { selected } = Route.useSearch();
	const navigate = Route.useNavigate();

	function onSelect(id?: string) {
		navigate({
			search: {
				selected: id ?? undefined,
			},
		});
	}

	const selectedLocation = useMemo(() => {
		const loc = cameras.find((l) => l.id === selected);

		if (!loc) return undefined;

		const location = {
			...loc,
			location: {
				lat: parseFloat(loc.location.latitude),
				lng: parseFloat(loc.location.longitude),
			},
		};

		return location;
	}, [cameras, selected]);

	return { selected, onSelect, selectedLocation };
}
