import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { camerasService } from "@/lib/services/cameras";

export function useCameraScenarios(camera: string) {
	const {
		data = [],
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["camera-scenarios"],
		queryFn: async () => await camerasService.scenarios(camera),
		select: (data) => data.payload,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { scenarios: data, loading };
}
