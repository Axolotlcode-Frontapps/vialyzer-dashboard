import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useSelectedLocation() {
	const routeApi = getRouteApi("/_dashboard/");

	const queryClient = useQueryClient();
	const navigate = routeApi.useNavigate();
	const { selected } = routeApi.useSearch();

	const cameras =
		queryClient.getQueryData<GeneralResponse<Camera[]>>(["get-cameras"])
			?.payload ?? [];

	const onSelect = useCallback(
		(id?: string) => {
			navigate({
				search: () => ({
					selected: id ?? undefined,
				}),
			});
		},
		[navigate]
	);

	const selectedLocation = useMemo(() => {
		const loc = cameras?.find((l) => l.id === selected);

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
